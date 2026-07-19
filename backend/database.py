import sys
import os
import time

# Move vendored packages to end of sys.path so pip-installed takes priority
if os.environ.get('VERCEL'):
    orig = list(sys.path)
    sys.path = [p for p in orig if '_vendor' not in p] + [p for p in orig if '_vendor' in p]

from pymongo import MongoClient
from pymongo.database import Database as MongoDatabase
from pymongo.errors import ConnectionFailure
from config import settings
from structlog import get_logger

logger = get_logger(__name__)

client: MongoClient | None = None
db: MongoDatabase | None = None
_last_connection_attempt: float = 0
_connection_cooldown: float = 30.0  # seconds before retry after failure
MAX_RETRIES = 3
RETRY_DELAY = 1.0


def _test_connection(c: MongoClient) -> bool:
    try:
        c.admin.command("ping", serverSelectionTimeoutMS=2000)
        return True
    except Exception:
        return False


def get_mongo_client() -> MongoClient:
    global client, _last_connection_attempt
    if client is not None:
        return client

    now = time.time()
    if _last_connection_attempt > 0 and (now - _last_connection_attempt) < _connection_cooldown:
        return client

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            c = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=2000)
            if _test_connection(c):
                client = c
                _last_connection_attempt = 0
                logger.info("MongoDB connected")
                return client
            else:
                c.close()
        except Exception:
            pass

        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY * attempt)

    _last_connection_attempt = time.time()
    logger.warning("MongoDB unreachable after retries, will retry later")
    return None


def get_database() -> MongoDatabase:
    global db
    if db is None:
        c = get_mongo_client()
        if c:
            db = c[settings.mongodb_db_name]
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
    """Initialize database collections and indexes (with short timeout)"""
    # Quick connectivity test first
    quick_client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=3000)
    try:
        quick_client.admin.command("ping")
    except Exception:
        logger.warning("Database not reachable during startup, skipping init")
        quick_client.close()
        return
    quick_client.close()
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
            {"_id": "topics", "seq": 0},
        ])

    logger.info("Database initialized")
