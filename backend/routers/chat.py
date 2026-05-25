from fastapi import APIRouter, Request, Depends, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from structlog import get_logger
from pymongo.database import Database

from models.book import ChatRequest, GlobalChatRequest, ChatResponse
from database import get_db
from repositories.book_repository import BookRepository
from services.llm_service import llm_service
from exceptions import NotFoundException
from validators import validate_book_id

router = APIRouter()
logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)

@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, chat_request: ChatRequest, db: Database = Depends(get_db)):
    """Chat with AI about a specific book"""
    logger.info("Chat request received", book_id=chat_request.bookId, message_count=len(chat_request.messages))

    validate_book_id(chat_request.bookId)

    book_repo = BookRepository(db)
    book_model = book_repo.get_book_by_id(chat_request.bookId)

    if not book_model:
        logger.warning("Book not found for chat", book_id=chat_request.bookId)
        raise NotFoundException(f"Book with id {chat_request.bookId} not found")

    book = book_repo.to_pydantic(book_model)

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]

    try:
        response = llm_service.generate_response(book.aiContext, messages)
        return ChatResponse(response=response)
    except RuntimeError as e:
        logger.error("Chat generation failed", book_id=chat_request.bookId, error=str(e))
        raise HTTPException(status_code=502, detail=str(e))

@router.post("/global", response_model=ChatResponse)
@limiter.limit("20/minute")
async def global_chat(request: Request, chat_request: GlobalChatRequest):
    """Chat with AI globally using a custom system instruction (e.g. AiContextFinder)"""
    logger.info("Global chat request received", message_count=len(chat_request.messages))

    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]

    try:
        response = llm_service.generate_response(chat_request.systemInstruction, messages)
        return ChatResponse(response=response)
    except RuntimeError as e:
        logger.error("Global chat generation failed", error=str(e))
        raise HTTPException(status_code=502, detail=str(e))
