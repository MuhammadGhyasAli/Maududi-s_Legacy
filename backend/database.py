from pymongo import MongoClient
from pymongo.database import Database as MongoDatabase
from pymongo.errors import ConnectionFailure
from config import settings
from structlog import get_logger

logger = get_logger(__name__)

client: MongoClient | None = None
db: MongoDatabase | None = None


def _create_ssl_context():
    """Create a relaxed SSL context for environments where Atlas TLS handshake fails."""
    import ssl
    import warnings
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        # Prefer TLS 1.2 ciphers for broader compatibility
        try:
            ctx.set_ciphers("HIGH:!aNULL:!eNULL:!MD5:!3DES:@SECLEVEL=1")
        except Exception:
            pass
        return ctx
    except Exception:
        warnings.warn("Failed to create custom SSL context, using default")
        return None


def get_mongo_client() -> MongoClient:
    global client
    if client is None:
        kwargs = {
            "serverSelectionTimeoutMS": 20000,
        }
        ssl_ctx = _create_ssl_context()
        if ssl_ctx is not None:
            kwargs["ssl_context"] = ssl_ctx
        client = MongoClient(settings.mongodb_url, **kwargs)
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
