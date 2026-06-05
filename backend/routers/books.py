from fastapi import APIRouter, Request, Depends
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from structlog import get_logger
from pymongo.database import Database

from models.book import Book, BookResponse
from database import get_db
from repositories.book_repository import BookRepository
from exceptions import NotFoundException
from validators import validate_book_id, validate_category
from data.books import BOOKS_DATA

router = APIRouter()
logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)

# Default categories from hardcoded data (fallback)
DEFAULT_CATEGORIES = [
    "All", "Tafsir", "Politics", "Theology", "Economics", 
    "Jurisprudence", "Social Issues", "History", "Guidance"
]


def _seed_books() -> list[Book]:
    return [Book(**b) for b in BOOKS_DATA]


@router.get("", response_model=list[BookResponse])
@limiter.limit("100/minute")
async def get_books(request: Request, category: Optional[str] = None, search: Optional[str] = None, db: Database = Depends(get_db)):
    """Get all books or filter by category and/or search term"""
    logger.info("Fetching books", category=category, search=search)
    
    # Validate category if provided
    if category:
        category = validate_category(category)
    
    if db is None:
        logger.warning("Database unavailable, using local seed data")
        all_books = _seed_books()
        if category and category != "All":
            all_books = [b for b in all_books if b.category.lower() == category.lower()]
        if search:
            term = search.lower()
            all_books = [b for b in all_books if
                         term in b.title.lower() or
                         term in b.description.lower() or
                         term in b.author.lower() or
                         (b.aiContext and term in b.aiContext.lower())]
        return all_books

    book_repo = BookRepository(db)
    
    try:
        if category:
            books_models = book_repo.get_books_by_category(category)
        else:
            books_models = book_repo.get_all_books()
        
        # Convert to Pydantic models
        books = [book_repo.to_pydantic(book) for book in books_models]
        
        if search:
            term = search.lower()
            books = [b for b in books if
                     term in b.title.lower() or
                     term in b.description.lower() or
                     term in b.author.lower() or
                     (b.aiContext and term in b.aiContext.lower())]
        
        logger.info("Books fetched successfully", count=len(books))
        return books
    except Exception as e:
        logger.warning("Failed to fetch books from database, using local seed data", error=str(e))
        all_books = _seed_books()
        if category and category != "All":
            all_books = [b for b in all_books if b.category.lower() == category.lower()]
        if search:
            term = search.lower()
            all_books = [b for b in all_books if
                         term in b.title.lower() or
                         term in b.description.lower() or
                         term in b.author.lower() or
                         (b.aiContext and term in b.aiContext.lower())]
        return all_books

@router.get("/categories", response_model=list[str])
@limiter.limit("100/minute")
async def get_categories(request: Request, db: Database = Depends(get_db)):
    """Get all available categories"""
    logger.info("Fetching categories")
    
    if db is None:
        logger.warning("Database unavailable, using default categories")
        return DEFAULT_CATEGORIES

    book_repo = BookRepository(db)
    try:
        categories = book_repo.get_categories()
        if categories:
            return ["All"] + categories
    except Exception as e:
        logger.warning("Failed to fetch categories from database, using defaults", error=str(e))
    
    # Fallback to default categories
    return DEFAULT_CATEGORIES

@router.get("/{book_id}", response_model=BookResponse)
@limiter.limit("100/minute")
async def get_book(request: Request, book_id: int, db: Database = Depends(get_db)):
    """Get a specific book by ID"""
    logger.info("Fetching book", book_id=book_id)
    
    # Validate book ID
    validate_book_id(book_id)
    
    if db is None:
        logger.warning("Database unavailable, using local seed data for book", book_id=book_id)
        for b in _seed_books():
            if b.id == book_id:
                return b
        raise NotFoundException(f"Book with id {book_id} not found")

    try:
        book_repo = BookRepository(db)
        book_model = book_repo.get_book_by_id(book_id)
        
        if not book_model:
            logger.warning("Book not found", book_id=book_id)
            raise NotFoundException(f"Book with id {book_id} not found")
        
        book = book_repo.to_pydantic(book_model)
        logger.info("Book fetched successfully", book_id=book_id)
        return book
    except NotFoundException:
        raise
    except Exception as e:
        logger.warning("Failed to fetch book from database, using local seed data", error=str(e), book_id=book_id)
        for b in _seed_books():
            if b.id == book_id:
                return b
        raise NotFoundException(f"Book with id {book_id} not found")
