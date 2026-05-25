"""
Script to migrate hardcoded book data to database
Run this after setting up the database to populate it with initial book data
"""
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, init_db
from models.db_models import BookModel
from data.books import BOOKS_DATA
from structlog import get_logger

logger = get_logger(__name__)


def migrate_books():
    """Migrate hardcoded book data to database"""
    db = SessionLocal()
    
    try:
        # Initialize database tables
        init_db()
        logger.info("Database initialized")
        
        # Migrate/Upsert books
        logger.info(f"Syncing {len(BOOKS_DATA)} books with the database")
        added_count = 0
        updated_count = 0
        
        for book_data in BOOKS_DATA:
            # Check if book already exists
            db_book = db.query(BookModel).filter(BookModel.id == book_data["id"]).first()
            
            if db_book:
                # Update existing book
                db_book.title = book_data["title"]
                db_book.author = book_data["author"]
                db_book.description = book_data["description"]
                db_book.image_url = book_data["imageUrl"]
                db_book.pdf_url = book_data["pdfUrl"]
                db_book.ai_context = book_data["aiContext"]
                db_book.publication_year = book_data["publicationYear"]
                db_book.category = book_data["category"]
                updated_count += 1
            else:
                # Convert camelCase to snake_case for database columns
                db_book = BookModel(
                    id=book_data["id"],
                    title=book_data["title"],
                    author=book_data["author"],
                    description=book_data["description"],
                    image_url=book_data["imageUrl"],
                    pdf_url=book_data["pdfUrl"],
                    ai_context=book_data["aiContext"],
                    publication_year=book_data["publicationYear"],
                    category=book_data["category"]
                )
                db.add(db_book)
                added_count += 1
        
        db.commit()
        logger.info(f"Successfully migrated books. Added: {added_count}, Updated: {updated_count}")
        
        # Verify migration
        final_count = db.query(BookModel).count()
        logger.info(f"Database now contains {final_count} books")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Migration failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_books()
