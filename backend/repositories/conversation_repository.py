from pymongo.database import Database
from typing import Optional, List

from models.db_models import ConversationModel, ConversationMemberModel, MessageModel
from database import get_next_id


class ConversationRepository:
    def __init__(self, db: Database):
        self.db = db

    def _convo_from_doc(self, doc: dict) -> Optional[ConversationModel]:
        if not doc:
            return None
        return ConversationModel(**doc)

    def _member_from_doc(self, doc: dict) -> Optional[ConversationMemberModel]:
        if not doc:
            return None
        return ConversationMemberModel(**doc)

    def _msg_from_doc(self, doc: dict) -> Optional[MessageModel]:
        if not doc:
            return None
        return MessageModel(**doc)

    def get_conversation_if_member(self, conversation_id: int, user_id: int) -> Optional[ConversationModel]:
        convo = self.db.conversations.find_one({"id": conversation_id})
        if not convo:
            return None
        member = self.db.conversation_members.find_one(
            {"conversation_id": conversation_id, "user_id": user_id}
        )
        if not member:
            return None
        return self._convo_from_doc(convo)

    def get_member(self, conversation_id: int, user_id: int) -> Optional[ConversationMemberModel]:
        doc = self.db.conversation_members.find_one(
            {"conversation_id": conversation_id, "user_id": user_id}
        )
        return self._member_from_doc(doc)

    def get_or_create_dm(self, user_id_a: int, user_id_b: int) -> ConversationModel:
        existing = self.db.conversations.aggregate([
            {"$match": {"type": "dm"}},
            {"$lookup": {
                "from": "conversation_members",
                "localField": "id",
                "foreignField": "conversation_id",
                "as": "members",
            }},
            {"$match": {
                "members.user_id": {"$all": [user_id_a, user_id_b]},
            }},
            {"$addFields": {"member_count": {"$size": "$members"}}},
            {"$match": {"member_count": 2}},
            {"$limit": 1},
        ])
        for convo in existing:
            return self._convo_from_doc(convo)

        convo_id = get_next_id("conversations")
        convo_doc = {"id": convo_id, "type": "dm"}
        self.db.conversations.insert_one(convo_doc)

        self.db.conversation_members.insert_many([
            {"conversation_id": convo_id, "user_id": user_id_a, "role": "member"},
            {"conversation_id": convo_id, "user_id": user_id_b, "role": "member"},
        ])

        return self._convo_from_doc(convo_doc)

    def list_conversations_for_user(self, user_id: int) -> List[ConversationModel]:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$sort": {"conversation_id": -1}},
            {"$lookup": {
                "from": "conversations",
                "localField": "conversation_id",
                "foreignField": "id",
                "as": "conversation",
            }},
            {"$unwind": "$conversation"},
            {"$replaceRoot": {"newRoot": "$conversation"}},
        ]
        convos = list(self.db.conversation_members.aggregate(pipeline))
        return [self._convo_from_doc(c) for c in convos]

    def list_members(self, conversation_id: int) -> List[ConversationMemberModel]:
        docs = list(self.db.conversation_members.find(
            {"conversation_id": conversation_id}
        ))
        return [self._member_from_doc(d) for d in docs]

    def create_message(self, conversation_id: int, sender_id: int, body: str) -> MessageModel:
        msg_id = get_next_id("messages")
        msg = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "body": body,
        }
        self.db.messages.insert_one(msg)
        return self._msg_from_doc(msg)

    def list_messages(self, conversation_id: int, limit: int = 50, before_id: Optional[int] = None) -> List[MessageModel]:
        query = {"conversation_id": conversation_id}
        if before_id:
            query["id"] = {"$lt": before_id}
        docs = list(self.db.messages.find(query).sort("id", -1).limit(limit))
        docs.reverse()
        return [self._msg_from_doc(d) for d in docs]

    def mark_read(self, conversation_id: int, user_id: int, last_read_message_id: int):
        result = self.db.conversation_members.update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {"$set": {"last_read_message_id": last_read_message_id, "last_read_at": None}},
        )
        if result.matched_count == 0:
            return None
        return self.get_member(conversation_id, user_id)
