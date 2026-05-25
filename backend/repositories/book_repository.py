from sqlalchemy.orm import Session
from typing import List, Optional
from models.db_models import BookModel
from models.book import Book, BookResponse
from services.cache_service import cache_service


class BookRepository:
    """Repository for book database operations with caching"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_books(self, category: Optional[str] = None, use_cache: bool = True) -> List[BookModel]:
        """Get all books, optionally filtered by category"""
        # Try cache first
        if use_cache:
            cached_books = cache_service.get_books(category)
            if cached_books:
                return cached_books
        
        query = self.db.query(BookModel)
        if category and category != "All":
            query = query.filter(BookModel.category == category)
        books = query.all()
        
        # Cache the results
        if use_cache:
            cache_service.set_books(category, books)
        
        return books
    
    def get_book_by_id(self, book_id: int, use_cache: bool = True) -> Optional[BookModel]:
        """Get a specific book by ID"""
        # Try cache first
        if use_cache:
            cached_book = cache_service.get_book(book_id)
            if cached_book:
                return cached_book
        
        book = self.db.query(BookModel).filter(BookModel.id == book_id).first()
        
        # Cache the result
        if use_cache and book:
            cache_service.set_book(book_id, book)
        
        return book
    
    def get_books_by_category(self, category: str, use_cache: bool = True) -> List[BookModel]:
        """Get books filtered by category"""
        if category == "All":
            return self.get_all_books(use_cache=use_cache)
        return self.get_all_books(category, use_cache=use_cache)
    
    def create_book(self, book_data: dict) -> BookModel:
        """Create a new book"""
        book = BookModel(**book_data)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        
        # Invalidate cache
        cache_service.invalidate_books()
        cache_service.invalidate_categories()
        
        return book
    
    def update_book(self, book_id: int, book_data: dict) -> Optional[BookModel]:
        """Update an existing book"""
        book = self.get_book_by_id(book_id, use_cache=False)
        if book:
            for key, value in book_data.items():
                setattr(book, key, value)
            self.db.commit()
            self.db.refresh(book)
            
            # Invalidate cache
            cache_service.invalidate_book(book_id)
            cache_service.invalidate_books()
        
        return book
    
    def delete_book(self, book_id: int) -> bool:
        """Delete a book"""
        book = self.get_book_by_id(book_id, use_cache=False)
        if book:
            self.db.delete(book)
            self.db.commit()
            
            # Invalidate cache
            cache_service.invalidate_book(book_id)
            cache_service.invalidate_books()
            cache_service.invalidate_categories()
            
            return True
        return False
    
    def get_categories(self, use_cache: bool = True) -> List[str]:
        """Get all unique categories"""
        # Try cache first
        if use_cache:
            cached_categories = cache_service.get_categories()
            if cached_categories:
                return cached_categories
        
        categories = self.db.query(BookModel.category).distinct().all()
        result = [cat[0] for cat in categories]
        
        # Cache the result
        if use_cache:
            cache_service.set_categories(result)
        
        return result
    
    def to_pydantic(self, book_model: BookModel) -> Book:
        """Convert SQLAlchemy model to Pydantic model"""
        return Book(
            id=book_model.id,
            title=book_model.title,
            author=book_model.author,
            description=book_model.description,
            imageUrl=book_model.image_url,
            pdfUrl=book_model.pdf_url,
            aiContext=book_model.ai_context,
            publicationYear=book_model.publication_year,
            category=book_model.category
        )
