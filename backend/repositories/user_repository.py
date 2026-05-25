from pymongo.database import Database
from typing import Optional
from models.db_models import UserModel
from database import get_next_id


class UserRepository:
    def __init__(self, db: Database):
        self.db = db

    def _doc_to_model(self, doc: dict) -> Optional[UserModel]:
        if not doc:
            return None
        return UserModel(**doc)

    def get_by_id(self, user_id: int) -> Optional[UserModel]:
        doc = self.db.users.find_one({"id": user_id})
        return self._doc_to_model(doc)

    def get_by_email(self, email: str) -> Optional[UserModel]:
        doc = self.db.users.find_one({"email": email})
        return self._doc_to_model(doc)

    def get_by_username(self, username: str) -> Optional[UserModel]:
        doc = self.db.users.find_one({"username": username})
        return self._doc_to_model(doc)

    def get_by_google_id(self, google_id: str) -> Optional[UserModel]:
        doc = self.db.users.find_one({"google_id": google_id})
        return self._doc_to_model(doc)

    def create(self, username: str, email: str, password_hash: str, display_name: str = "") -> UserModel:
        user = {
            "id": get_next_id("users"),
            "username": username,
            "email": email,
            "display_name": display_name or username,
            "password_hash": password_hash,
            "google_id": None,
            "is_active": True,
            "is_verified": False,
        }
        self.db.users.insert_one(user)
        return self._doc_to_model(user)

    def update(self, user_id: int, data: dict) -> Optional[UserModel]:
        doc = self.db.users.find_one({"id": user_id})
        if not doc:
            return None
        self.db.users.update_one({"id": user_id}, {"$set": data})
        return self.get_by_id(user_id)

    def delete(self, user_id: int) -> bool:
        result = self.db.users.delete_one({"id": user_id})
        return result.deleted_count > 0
