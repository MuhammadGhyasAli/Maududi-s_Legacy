import logging
from typing import Optional, List, Dict, Any
from pymongo.database import Database

from models.db_models import UserModel
from repositories.conversation_repository import ConversationRepository
from services.topic_service import extract_topics_from_text

logger = logging.getLogger(__name__)


def _extract_user_text(messages: List[Dict[str, Any]]) -> str:
    parts = []
    for m in messages:
        if m.get("role") == "user" and isinstance(m.get("content"), str):
            parts.append(m["content"])
    return " ".join(parts)


def _extract_topics(user_text: str) -> List[str]:
    if user_text.strip():
        return extract_topics_from_text(user_text) or []
    return []


def persist_conversation(
    db: Database,
    current_user: Optional[UserModel],
    messages: List[Dict[str, Any]],
    response_text: str,
    conversation_id: Optional[int] = None,
    book_id: int = 0,
    book_title: str = "",
    book_slug: str = "",
    conv_type: str = "book_chat",
) -> Optional[int]:
    if not current_user or db is None or not response_text:
        return None

    try:
        repo = ConversationRepository(db)
        saved_id = conversation_id

        if conversation_id:
            conv = repo.get_conversation(conversation_id)
            if conv:
                repo.create_message(conversation_id, "assistant", response_text)
                count = conv.message_count + 1
                repo.update_conversation_message_count(conversation_id, count)
                saved_id = conversation_id
        else:
            conv = repo.create_conversation(
                user_id=current_user.id,
                book_id=book_id,
                book_title=book_title,
                book_slug=book_slug,
                conv_type=conv_type,
            )
            for m in messages:
                role = m.get("role", "user")
                content = m.get("content", "")
                if not isinstance(content, str):
                    content = str(content)
                repo.create_message(conv.id, role, content)
            repo.create_message(conv.id, "assistant", response_text)
            repo.update_conversation_message_count(conv.id, len(messages) + 1)
            saved_id = conv.id

        if saved_id:
            user_text = _extract_user_text(messages)
            topics = _extract_topics(user_text)
            if topics:
                repo.update_conversation_topics(saved_id, topics)

        return saved_id

    except Exception as e:
        logger.error("Failed to persist conversation", error=str(e))
        return None
