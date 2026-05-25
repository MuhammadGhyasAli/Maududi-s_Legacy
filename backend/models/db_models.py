from datetime import datetime, timezone
from typing import Optional


class ModelBase:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class BookModel(ModelBase):
    pass


class UserModel(ModelBase):
    pass


class PasswordResetTokenModel(ModelBase):
    pass


class ConversationModel(ModelBase):
    pass


class MessageModel(ModelBase):
    pass


class ConversationMemberModel(ModelBase):
    pass
