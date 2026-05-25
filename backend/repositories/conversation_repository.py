from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List

from models.db_models import (
    ConversationModel,
    ConversationMemberModel,
    MessageModel,
)


class ConversationRepository:
    """Repository for user-to-user messaging (v1: DM)."""

    def __init__(self, db: Session):
        self.db = db

    def get_conversation_if_member(self, conversation_id: int, user_id: int) -> Optional[ConversationModel]:
        return (
            self.db.query(ConversationModel)
            .join(ConversationMemberModel, ConversationMemberModel.conversation_id == ConversationModel.id)
            .filter(ConversationModel.id == conversation_id, ConversationMemberModel.user_id == user_id)
            .first()
        )

    def get_member(self, conversation_id: int, user_id: int) -> Optional[ConversationMemberModel]:
        return (
            self.db.query(ConversationMemberModel)
            .filter(ConversationMemberModel.conversation_id == conversation_id, ConversationMemberModel.user_id == user_id)
            .first()
        )

    def get_or_create_dm(self, user_id_a: int, user_id_b: int) -> ConversationModel:
        """
        Create or fetch a DM conversation between exactly two users.
        """
        # Find conversation that has both members (and type == dm)
        convo = (
            self.db.query(ConversationModel)
            .filter(ConversationModel.type == "dm")
            .join(ConversationMemberModel, ConversationMemberModel.conversation_id == ConversationModel.id)
            .filter(ConversationMemberModel.user_id.in_([user_id_a, user_id_b]))
            .group_by(ConversationModel.id)
            .having(func.count(func.distinct(ConversationMemberModel.user_id)) == 2)
            .first()
        )
        if convo:
            return convo

        convo = ConversationModel(type="dm")
        self.db.add(convo)
        self.db.flush()  # obtain convo.id

        self.db.add_all(
            [
                ConversationMemberModel(conversation_id=convo.id, user_id=user_id_a, role="member"),
                ConversationMemberModel(conversation_id=convo.id, user_id=user_id_b, role="member"),
            ]
        )
        self.db.commit()
        self.db.refresh(convo)
        return convo

    def list_conversations_for_user(self, user_id: int) -> List[ConversationModel]:
        return (
            self.db.query(ConversationModel)
            .join(ConversationMemberModel, ConversationMemberModel.conversation_id == ConversationModel.id)
            .filter(ConversationMemberModel.user_id == user_id)
            .order_by(ConversationModel.id.desc())
            .all()
        )

    def list_members(self, conversation_id: int) -> List[ConversationMemberModel]:
        return (
            self.db.query(ConversationMemberModel)
            .filter(ConversationMemberModel.conversation_id == conversation_id)
            .all()
        )

    def create_message(self, conversation_id: int, sender_id: int, body: str) -> MessageModel:
        msg = MessageModel(conversation_id=conversation_id, sender_id=sender_id, body=body)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def list_messages(self, conversation_id: int, limit: int = 50, before_id: Optional[int] = None) -> List[MessageModel]:
        q = self.db.query(MessageModel).filter(MessageModel.conversation_id == conversation_id)
        if before_id:
            q = q.filter(MessageModel.id < before_id)
        return q.order_by(MessageModel.id.desc()).limit(limit).all()[::-1]

    def mark_read(self, conversation_id: int, user_id: int, last_read_message_id: int):
        member = self.get_member(conversation_id, user_id)
        if not member:
            return None
        member.last_read_message_id = last_read_message_id
        member.last_read_at = func.now()
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

