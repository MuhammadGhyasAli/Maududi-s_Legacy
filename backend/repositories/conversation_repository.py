from pymongo.database import Database
from typing import Optional, List
from datetime import datetime, timezone

from models.db_models import ConversationModel, MessageModel
from database import get_next_id


class ConversationRepository:
    def __init__(self, db: Database):
        self.db = db

    def _convo_from_doc(self, doc: dict) -> Optional[ConversationModel]:
        if not doc:
            return None
        return ConversationModel(**doc)

    def _msg_from_doc(self, doc: dict) -> Optional[MessageModel]:
        if not doc:
            return None
        return MessageModel(**doc)

    def create_conversation(
        self,
        user_id: int,
        book_id: int,
        book_title: str,
        book_slug: str,
        conv_type: str = "book_chat",
    ) -> ConversationModel:
        convo_id = get_next_id("conversations")
        now = datetime.now(timezone.utc)
        doc = {
            "id": convo_id,
            "user_id": user_id,
            "book_id": book_id,
            "book_title": book_title,
            "book_slug": book_slug,
            "type": conv_type,
            "topics": [],
            "message_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        self.db.conversations.insert_one(doc)
        return self._convo_from_doc(doc)

    def get_conversation(self, conversation_id: int) -> Optional[ConversationModel]:
        doc = self.db.conversations.find_one({"id": conversation_id})
        return self._convo_from_doc(doc)

    def list_conversations_for_user(
        self, user_id: int, book_id: Optional[int] = None, limit: int = 20
    ) -> List[ConversationModel]:
        query: dict = {"user_id": user_id}
        if book_id is not None:
            query["book_id"] = book_id
        docs = list(
            self.db.conversations.find(query)
            .sort("updated_at", -1)
            .limit(limit)
        )
        return [self._convo_from_doc(d) for d in docs]

    def update_conversation_topics(
        self, conversation_id: int, topics: list
    ) -> None:
        self.db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"topics": topics, "updated_at": datetime.now(timezone.utc)}},
        )

    def update_conversation_message_count(
        self, conversation_id: int, count: int
    ) -> None:
        self.db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"message_count": count, "updated_at": datetime.now(timezone.utc)}},
        )

    def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        result = self.db.conversations.delete_one(
            {"id": conversation_id, "user_id": user_id}
        )
        self.db.messages.delete_many({"conversation_id": conversation_id})
        return result.deleted_count > 0

    def create_message(
        self, conversation_id: int, role: str, content: str
    ) -> MessageModel:
        msg_id = get_next_id("messages")
        now = datetime.now(timezone.utc)
        msg = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "created_at": now,
        }
        self.db.messages.insert_one(msg)
        return self._msg_from_doc(msg)

    def list_messages(
        self, conversation_id: int, limit: int = 100, before_id: Optional[int] = None
    ) -> List[MessageModel]:
        query = {"conversation_id": conversation_id}
        if before_id:
            query["id"] = {"$lt": before_id}
        docs = list(
            self.db.messages.find(query).sort("id", 1).limit(limit)
        )
        return [self._msg_from_doc(d) for d in docs]

    def create_shared_conversation(self, conversation_id: int) -> str:
        import secrets
        share_id = secrets.token_urlsafe(12)
        self.db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"share_id": share_id, "shared_at": datetime.now(timezone.utc)}},
        )
        return share_id

    def get_conversation_by_share_id(self, share_id: str) -> Optional[ConversationModel]:
        doc = self.db.conversations.find_one({"share_id": share_id})
        return self._convo_from_doc(doc)
