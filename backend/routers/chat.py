from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from structlog import get_logger
from pymongo.database import Database
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, timezone

from models.book import Book, ChatRequest, GlobalChatRequest
from database import get_db
from repositories.book_repository import BookRepository
from repositories.conversation_repository import ConversationRepository
from services.llm_service import llm_service
from services.agent_pipeline import agent_pipeline
from services.topic_service import extract_topics_from_text
from exceptions import NotFoundException
from validators import validate_book_id
from data.books import BOOKS_DATA
from routers.auth import get_current_user, decode_access_token
from models.db_models import UserModel, ConversationModel

router = APIRouter()
logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)


async def optional_user(
    request: Request,
    db: Database = Depends(get_db),
) -> Optional[UserModel]:
    """Get current user or None (does not raise on missing auth)."""
    auth_header = request.headers.get("Authorization", "")
    cookie_token = request.cookies.get("auth_token")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = cookie_token
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", 0))
        from repositories.user_repository import UserRepository
        from database import get_db as _get_db
        if db:
            repo = UserRepository(db)
            return repo.get_by_id(user_id)
    except Exception:
        return None
    return None


# ── Shared ──

FOLLOW_UP_PROMPT = (
    "\n\nAfter answering, suggest 2-3 brief follow-up questions the user might ask next. "
    "Format them as a bullet list under a '### Follow-up Questions' heading. "
    "Each should start with '• ' and be a complete question. Do not number them."
)


def _build_follow_up_prompt(selected_language: str) -> str:
    return (
        f"\n\nIMPORTANT: After your main response, suggest exactly 3 brief follow-up "
        f"questions the user might ask next. Format them EXACTLY like this:\n\n"
        f"### Follow-up Questions\n"
        f"• First question here?\n"
        f"• Second question here?\n"
        f"• Third question here?\n\n"
        f"The follow-up questions must be in {selected_language}. "
        f"They should be genuine, insightful questions related to the topic."
    )


def _parse_follow_ups(text: str) -> tuple[str, list[str]]:
    """Extract follow-up questions from AI response. Returns (clean_text, questions)."""
    import re
    pattern = r'### Follow-up Questions\s*\n((?:•\s*.+\n?)*)'
    match = re.search(pattern, text, re.MULTILINE)
    questions: list[str] = []
    if match:
        block = match.group(1)
        questions = [
            q.strip().lstrip("• ").strip()
            for q in block.strip().split("\n")
            if q.strip().startswith("• ")
        ]
        text = text[:match.start()].strip()
    return text, questions


# ── Schemas ──

class BranchRequest(BaseModel):
    conversationId: int
    messageId: int
    messages: list

class ShareResponse(BaseModel):
    shareId: str
    url: str

class ConversationListItem(BaseModel):
    id: int
    bookId: int
    bookTitle: str
    bookSlug: str
    topics: list[str]
    messageCount: int
    createdAt: datetime
    updatedAt: datetime

class ConversationDetail(BaseModel):
    id: int
    bookId: int
    bookTitle: str
    bookSlug: str
    topics: list[str]
    messages: list
    createdAt: datetime
    updatedAt: datetime

class BookSuggestion(BaseModel):
    id: int
    title: str
    category: str
    description: str
    imageUrl: str
    reason: str


# ── Chat Endpoints ──

@router.post("", response_model=dict)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    chat_request: ChatRequest,
    db: Database = Depends(get_db),
    current_user: Optional[UserModel] = Depends(optional_user),
):
    """Chat with AI about a specific book, with topic tracking & persistence."""
    logger.info("Chat request received", book_id=chat_request.bookId, message_count=len(chat_request.messages))

    validate_book_id(chat_request.bookId)

    if db is None:
        logger.warning("Database unavailable, using local seed data for chat", book_id=chat_request.bookId)
        book = None
        for b in BOOKS_DATA:
            if b["id"] == chat_request.bookId:
                book = Book(**b)
                break
    else:
        book_repo = BookRepository(db)
        book_model = book_repo.get_book_by_id(chat_request.bookId)
        if book_model:
            book = book_repo.to_pydantic(book_model)
        else:
            book = None

    if not book:
        logger.warning("Book not found for chat", book_id=chat_request.bookId)
        raise NotFoundException(f"Book with id {chat_request.bookId} not found")

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    selected_language = getattr(chat_request, "language", "English")

    # Add follow-up prompt to the system context
    enhanced_messages = list(messages)
    if enhanced_messages:
        last_user_msg = None
        for m in reversed(enhanced_messages):
            if m["role"] == "user":
                last_user_msg = m
                break
        if last_user_msg and isinstance(last_user_msg.get("content"), str):
            last_user_msg["content"] += _build_follow_up_prompt(selected_language)

    try:
        response_text = llm_service.generate_response(book.aiContext, enhanced_messages)
        clean_text, follow_ups = _parse_follow_ups(response_text)

        # ── Conversation persistence for authenticated users ──
        saved_id = None
        if current_user and db is not None:
            repo = ConversationRepository(db)
            conv_id = getattr(chat_request, "conversationId", None)

            if conv_id:
                conv = repo.get_conversation(conv_id)
                if not conv:
                    raise NotFoundException("Conversation not found")
                repo.create_message(conv_id, "assistant", clean_text)
                count = conv.message_count + 1
                repo.update_conversation_message_count(conv_id, count)
                saved_id = conv_id
            else:
                conv = repo.create_conversation(
                    user_id=current_user.id,
                    book_id=book.id,
                    book_title=book.title,
                    book_slug="",
                    conv_type="book_chat",
                )
                # Save all messages
                for m in messages:
                    role = m["role"]
                    content = m["content"] if isinstance(m["content"], str) else str(m["content"])
                    repo.create_message(conv.id, role, content)
                # Save AI response
                repo.create_message(conv.id, "assistant", clean_text)
                repo.update_conversation_message_count(conv.id, len(messages) + 1)
                saved_id = conv.id

            # Topic extraction
            user_text = ""
            for m in messages:
                if m["role"] == "user" and isinstance(m.get("content"), str):
                    user_text += " " + m["content"]
            if user_text.strip():
                topics = extract_topics_from_text(user_text)
                if topics:
                    repo.update_conversation_topics(saved_id, topics)

        return {
            "response": clean_text,
            "followUpQuestions": follow_ups,
            "conversationId": saved_id,
        }
    except RuntimeError as e:
        logger.error("Chat generation failed", book_id=chat_request.bookId, error=str(e))
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/global", response_model=dict)
@limiter.limit("20/minute")
async def global_chat(
    request: Request,
    chat_request: GlobalChatRequest,
    db: Database = Depends(get_db),
    current_user: Optional[UserModel] = Depends(optional_user),
):
    """Chat with AI globally, with persistence & topic tracking."""
    logger.info("Global chat request received", message_count=len(chat_request.messages))

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    selected_language = getattr(chat_request, "language", "English")

    enhanced_messages = list(messages)
    if enhanced_messages:
        last_user_msg = None
        for m in reversed(enhanced_messages):
            if m["role"] == "user":
                last_user_msg = m
                break
        if last_user_msg and isinstance(last_user_msg.get("content"), str):
            last_user_msg["content"] += _build_follow_up_prompt(selected_language)

    try:
        response_text = llm_service.generate_response(chat_request.systemInstruction, enhanced_messages)
        clean_text, follow_ups = _parse_follow_ups(response_text)

        saved_id = None
        if current_user and db is not None:
            repo = ConversationRepository(db)
            conv_id = getattr(chat_request, "conversationId", None)

            if conv_id:
                conv = repo.get_conversation(conv_id)
                if conv:
                    repo.create_message(conv_id, "assistant", clean_text)
                    count = conv.message_count + 1
                    repo.update_conversation_message_count(conv_id, count)
                    saved_id = conv_id
            else:
                conv = repo.create_conversation(
                    user_id=current_user.id,
                    book_id=0,
                    book_title="AI Context Finder",
                    book_slug="ai-context-finder",
                    conv_type="global_chat",
                )
                for m in messages:
                    role = m["role"]
                    content = m["content"] if isinstance(m["content"], str) else str(m["content"])
                    repo.create_message(conv.id, role, content)
                repo.create_message(conv.id, "assistant", clean_text)
                repo.update_conversation_message_count(conv.id, len(messages) + 1)
                saved_id = conv.id

            user_text = ""
            for m in messages:
                if m["role"] == "user" and isinstance(m.get("content"), str):
                    user_text += " " + m["content"]
            if user_text.strip():
                topics = extract_topics_from_text(user_text)
                if topics:
                    repo.update_conversation_topics(saved_id, topics)

        return {
            "response": clean_text,
            "followUpQuestions": follow_ups,
            "conversationId": saved_id,
        }
    except RuntimeError as e:
        logger.error("Global chat generation failed", error=str(e))
        raise HTTPException(status_code=502, detail=str(e))


# ── Agent Pipeline Streaming Endpoints ──

@router.post("/stream")
@limiter.limit("20/minute")
async def chat_stream(
    request: Request,
    chat_request: ChatRequest,
    db: Database = Depends(get_db),
    current_user: Optional[UserModel] = Depends(optional_user),
):
    """Stream chat with AI about a specific book using the 3-agent pipeline."""
    logger.info("Stream chat request received", book_id=chat_request.bookId, message_count=len(chat_request.messages))

    validate_book_id(chat_request.bookId)

    if db is None:
        book = None
        for b in BOOKS_DATA:
            if b["id"] == chat_request.bookId:
                book = Book(**b)
                break
    else:
        book_repo = BookRepository(db)
        book_model = book_repo.get_book_by_id(chat_request.bookId)
        if book_model:
            book = book_repo.to_pydantic(book_model)
        else:
            book = None

    if not book:
        raise NotFoundException(f"Book with id {chat_request.bookId} not found")

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    selected_language = getattr(chat_request, "language", "English")

    last_user_msg = ""
    for m in reversed(messages):
        if m["role"] == "user" and isinstance(m.get("content"), str):
            last_user_msg = m["content"]
            break

    conversation_id = getattr(chat_request, "conversationId", None)

    async def event_generator():
        full_response = ""
        final_conversation_id = conversation_id
        final_follow_ups = []

        async for event in agent_pipeline.run_stream(
            user_message=last_user_msg,
            messages=messages,
            system_context=book.aiContext,
            book_id=chat_request.bookId,
            language=selected_language,
            conversation_id=conversation_id,
        ):
            yield event

            import json
            for line in event.strip().split("\n"):
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        if "token" in data:
                            full_response += data["token"]
                        if data.get("conversationId"):
                            final_conversation_id = data["conversationId"]
                        if data.get("followUpQuestions"):
                            final_follow_ups = data["followUpQuestions"]
                    except json.JSONDecodeError:
                        pass

        if current_user and db is not None and full_response:
            try:
                repo = ConversationRepository(db)
                conv_id = conversation_id

                if conv_id:
                    conv = repo.get_conversation(conv_id)
                    if conv:
                        repo.create_message(conv_id, "assistant", full_response)
                        count = conv.message_count + 1
                        repo.update_conversation_message_count(conv_id, count)
                        final_conversation_id = conv_id
                else:
                    conv = repo.create_conversation(
                        user_id=current_user.id,
                        book_id=book.id,
                        book_title=book.title,
                        book_slug="",
                        conv_type="book_chat",
                    )
                    for m in messages:
                        role = m["role"]
                        content = m["content"] if isinstance(m["content"], str) else str(m["content"])
                        repo.create_message(conv.id, role, content)
                    repo.create_message(conv.id, "assistant", full_response)
                    repo.update_conversation_message_count(conv.id, len(messages) + 1)
                    final_conversation_id = conv.id

                    user_text = ""
                    for m in messages:
                        if m["role"] == "user" and isinstance(m.get("content"), str):
                            user_text += " " + m["content"]
                    if user_text.strip():
                        topics = extract_topics_from_text(user_text)
                        if topics:
                            repo.update_conversation_topics(final_conversation_id, topics)
            except Exception as e:
                logger.error("Failed to persist streamed conversation", error=str(e))

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/global/stream")
@limiter.limit("20/minute")
async def global_chat_stream(
    request: Request,
    chat_request: GlobalChatRequest,
    db: Database = Depends(get_db),
    current_user: Optional[UserModel] = Depends(optional_user),
):
    """Stream global chat with AI using the 3-agent pipeline."""
    logger.info("Stream global chat request received", message_count=len(chat_request.messages))

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    selected_language = getattr(chat_request, "language", "English")

    last_user_msg = ""
    for m in reversed(messages):
        if m["role"] == "user" and isinstance(m.get("content"), str):
            last_user_msg = m["content"]
            break

    conversation_id = getattr(chat_request, "conversationId", None)

    async def event_generator():
        full_response = ""
        final_conversation_id = conversation_id
        final_follow_ups = []

        async for event in agent_pipeline.run_stream(
            user_message=last_user_msg,
            messages=messages,
            system_context=chat_request.systemInstruction,
            language=selected_language,
            conversation_id=conversation_id,
        ):
            yield event

            import json
            for line in event.strip().split("\n"):
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        if "token" in data:
                            full_response += data["token"]
                        if data.get("conversationId"):
                            final_conversation_id = data["conversationId"]
                        if data.get("followUpQuestions"):
                            final_follow_ups = data["followUpQuestions"]
                    except json.JSONDecodeError:
                        pass

        if current_user and db is not None and full_response:
            try:
                repo = ConversationRepository(db)
                conv_id = conversation_id

                if conv_id:
                    conv = repo.get_conversation(conv_id)
                    if conv:
                        repo.create_message(conv_id, "assistant", full_response)
                        count = conv.message_count + 1
                        repo.update_conversation_message_count(conv_id, count)
                        final_conversation_id = conv_id
                else:
                    conv = repo.create_conversation(
                        user_id=current_user.id,
                        book_id=0,
                        book_title="AI Context Finder",
                        book_slug="ai-context-finder",
                        conv_type="global_chat",
                    )
                    for m in messages:
                        role = m["role"]
                        content = m["content"] if isinstance(m["content"], str) else str(m["content"])
                        repo.create_message(conv.id, role, content)
                    repo.create_message(conv.id, "assistant", full_response)
                    repo.update_conversation_message_count(conv.id, len(messages) + 1)
                    final_conversation_id = conv.id

                    user_text = ""
                    for m in messages:
                        if m["role"] == "user" and isinstance(m.get("content"), str):
                            user_text += " " + m["content"]
                    if user_text.strip():
                        topics = extract_topics_from_text(user_text)
                        if topics:
                            repo.update_conversation_topics(final_conversation_id, topics)
            except Exception as e:
                logger.error("Failed to persist streamed global conversation", error=str(e))

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Conversation CRUD Endpoints ──

@router.get("/conversations", response_model=list[ConversationListItem])
@limiter.limit("30/minute")
async def list_conversations(
    request: Request,
    book_id: Optional[int] = Query(None),
    limit: int = Query(20),
    db: Database = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """List conversations for the current user."""
    repo = ConversationRepository(db)
    convos = repo.list_conversations_for_user(current_user.id, book_id, limit)
    return [
        ConversationListItem(
            id=c.id,
            bookId=getattr(c, "book_id", 0),
            bookTitle=getattr(c, "book_title", ""),
            bookSlug=getattr(c, "book_slug", ""),
            topics=getattr(c, "topics", []),
            messageCount=getattr(c, "message_count", 0),
            createdAt=getattr(c, "created_at", datetime.now(timezone.utc)),
            updatedAt=getattr(c, "updated_at", datetime.now(timezone.utc)),
        )
        for c in convos
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
@limiter.limit("30/minute")
async def get_conversation(
    request: Request,
    conversation_id: int,
    db: Database = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get a single conversation with all messages."""
    repo = ConversationRepository(db)
    conv = repo.get_conversation(conversation_id)
    if not conv or getattr(conv, "user_id", None) != current_user.id:
        raise NotFoundException("Conversation not found")
    messages = repo.list_messages(conversation_id)
    return ConversationDetail(
        id=conv.id,
        bookId=getattr(conv, "book_id", 0),
        bookTitle=getattr(conv, "book_title", ""),
        bookSlug=getattr(conv, "book_slug", ""),
        topics=getattr(conv, "topics", []),
        messages=[{"id": m.id, "role": m.role, "content": m.content} for m in messages],
        createdAt=getattr(conv, "created_at", datetime.now(timezone.utc)),
        updatedAt=getattr(conv, "updated_at", datetime.now(timezone.utc)),
    )


@router.delete("/conversations/{conversation_id}")
@limiter.limit("30/minute")
async def delete_conversation(
    request: Request,
    conversation_id: int,
    db: Database = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Delete a conversation."""
    repo = ConversationRepository(db)
    deleted = repo.delete_conversation(conversation_id, current_user.id)
    if not deleted:
        raise NotFoundException("Conversation not found")
    return {"message": "Conversation deleted"}


@router.post("/conversations/{conversation_id}/share", response_model=ShareResponse)
@limiter.limit("20/minute")
async def share_conversation(
    request: Request,
    conversation_id: int,
    db: Database = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Generate a shareable link for a conversation."""
    repo = ConversationRepository(db)
    conv = repo.get_conversation(conversation_id)
    if not conv or getattr(conv, "user_id", None) != current_user.id:
        raise NotFoundException("Conversation not found")
    share_id = repo.create_shared_conversation(conversation_id)
    base_url = str(request.base_url).rstrip("/")
    return ShareResponse(
        shareId=share_id,
        url=f"{base_url}/shared/{share_id}",
    )


@router.get("/shared/{share_id}", response_model=ConversationDetail)
@limiter.limit("30/minute")
async def get_shared_conversation(
    request: Request,
    share_id: str,
    db: Database = Depends(get_db),
):
    """Get a shared conversation by share ID (no auth required)."""
    repo = ConversationRepository(db)
    conv = repo.get_conversation_by_share_id(share_id)
    if not conv:
        raise NotFoundException("Shared conversation not found")
    messages = repo.list_messages(conv.id)
    return ConversationDetail(
        id=conv.id,
        bookId=getattr(conv, "book_id", 0),
        bookTitle=getattr(conv, "book_title", ""),
        bookSlug=getattr(conv, "book_slug", ""),
        topics=getattr(conv, "topics", []),
        messages=[{"id": m.id, "role": m.role, "content": m.content} for m in messages],
        createdAt=getattr(conv, "created_at", datetime.now(timezone.utc)),
        updatedAt=getattr(conv, "updated_at", datetime.now(timezone.utc)),
    )


@router.post("/branch", response_model=dict)
@limiter.limit("20/minute")
async def branch_conversation(
    request: Request,
    branch: BranchRequest,
    db: Database = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Fork a conversation from a specific message."""
    repo = ConversationRepository(db)
    orig = repo.get_conversation(branch.conversationId)
    if not orig or getattr(orig, "user_id", None) != current_user.id:
        raise NotFoundException("Original conversation not found")

    conv = repo.create_conversation(
        user_id=current_user.id,
        book_id=getattr(orig, "book_id", 0),
        book_title=getattr(orig, "book_title", ""),
        book_slug=getattr(orig, "book_slug", ""),
        conv_type=getattr(orig, "type", "book_chat") + "_branch",
    )

    # Copy messages up to the branch point
    for msg in branch.messages:
        if isinstance(msg, dict):
            repo.create_message(conv.id, msg.get("role", "user"), msg.get("content", ""))
        elif hasattr(msg, "role") and hasattr(msg, "content"):
            repo.create_message(conv.id, msg.role, msg.content)

    return {"conversationId": conv.id}


# ── Topic-based Book Suggestions ──

@router.get("/suggestions", response_model=list[BookSuggestion])
def get_book_suggestions(
    request: Request,
    topics: str = Query(""),
    db: Database = Depends(get_db),
):
    """Suggest books based on topics."""
    if not topics:
        return []
    topic_list = [t.strip() for t in topics.split(",") if t.strip()]

    from data.books import BOOKS_DATA
    matched_books: list[BookSuggestion] = []
    seen_ids: set[int] = set()

    for book_data in BOOKS_DATA:
        book_cat = book_data.get("category", "").lower()
        book_ctx = book_data.get("aiContext", "").lower()
        for t in topic_list:
            if t.lower() in book_cat or t.lower() in book_ctx:
                if book_data["id"] not in seen_ids:
                    seen_ids.add(book_data["id"])
                    matched_books.append(BookSuggestion(
                        id=book_data["id"],
                        title=book_data["title"],
                        category=book_data["category"],
                        description=book_data["description"],
                        imageUrl=book_data["imageUrl"],
                        reason=f"Related to {t}",
                    ))
                break

    return matched_books[:5]
