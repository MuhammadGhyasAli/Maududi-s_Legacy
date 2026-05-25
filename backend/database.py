import ssl
# Patch SSLContext to lower security level for Atlas compatibility
_orig_init = ssl.SSLContext.__init__
def _patched_init(self, protocol=ssl.PROTOCOL_TLS_CLIENT, *args, **kwargs):
    _orig_init(self, protocol, *args, **kwargs)
    try:
        self.set_ciphers("DEFAULT:@SECLEVEL=0")
    except Exception:
        pass
    try:
        self.check_hostname = False
    except Exception:
        pass
    try:
        self.verify_mode = ssl.CERT_NONE
    except Exception:
        pass
ssl.SSLContext.__init__ = _patched_init

from pymongo import MongoClient
from pymongo.database import Database as MongoDatabase
from pymongo.errors import ConnectionFailure
from config import settings
from structlog import get_logger

logger = get_logger(__name__)

client: MongoClient | None = None
db: MongoDatabase | None = None


def get_mongo_client() -> MongoClient:
    global client
    if client is None:
        client = MongoClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=20000,
        )
    return client


def get_database() -> MongoDatabase:
    global db
    if db is None:
        mongo_client = get_mongo_client()
        db = mongo_client[settings.mongodb_db_name]
    return db


def get_db():
    """Dependency to get MongoDB database"""
    database = get_database()
    try:
        yield database
    finally:
        pass  # Connection pool managed by MongoClient


def get_next_id(collection_name: str) -> int:
    """Get next auto-increment ID for a collection using a counters collection"""
    database = get_database()
    counter = database.counters.find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return counter["seq"]


def init_db():
    """Initialize database collections and indexes"""
    database = get_database()
    collections = database.list_collection_names()

    needed = {"books", "users", "conversations", "conversation_members", "messages", "password_reset_tokens", "counters"}
    missing = needed - set(collections)
    if missing:
        logger.info("Creating collections", collections=list(missing))
        for name in missing:
            database.create_collection(name)

    database.books.create_index("id", unique=True)
    database.books.create_index("category")
    database.users.create_index("id", unique=True)
    database.users.create_index("username", unique=True)
    database.users.create_index("email", unique=True)
    database.users.create_index("google_id", sparse=True)
    database.conversations.create_index("id", unique=True)
    database.conversation_members.create_index([("conversation_id", 1), ("user_id", 1)], unique=True)
    database.conversation_members.create_index("user_id")
    database.messages.create_index("id", unique=True)
    database.messages.create_index("conversation_id")
    database.messages.create_index("created_at")
    database.password_reset_tokens.create_index("token_hash", unique=True)
    database.password_reset_tokens.create_index("expires_at")

    if database.counters.count_documents({}) == 0:
        database.counters.insert_many([
            {"_id": "books", "seq": 0},
            {"_id": "users", "seq": 0},
            {"_id": "conversations", "seq": 0},
            {"_id": "messages", "seq": 0},
            {"_id": "password_reset_tokens", "seq": 0},
        ])

    logger.info("Database initialized")
