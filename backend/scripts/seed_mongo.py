import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database, get_next_id
from data.books import BOOKS_DATA
from structlog import get_logger

logger = get_logger(__name__)


def seed():
    db = get_database()

    existing = db.books.count_documents({})
    if existing > 0:
        logger.info(f"Database already has {existing} books, skipping seed")
        return

    for book in BOOKS_DATA:
        doc = {
            "id": book["id"],
            "title": book["title"],
            "author": book["author"],
            "description": book["description"],
            "image_url": book["imageUrl"],
            "pdf_url": book["pdfUrl"],
            "ai_context": book["aiContext"],
            "publication_year": book["publicationYear"],
            "category": book["category"],
        }
        db.books.insert_one(doc)

    logger.info(f"Seeded {len(BOOKS_DATA)} books")


if __name__ == "__main__":
    seed()
