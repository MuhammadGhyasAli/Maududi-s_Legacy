import json
from typing import Optional, Any
from cachetools import TTLCache
from structlog import get_logger

from config import settings

logger = get_logger(__name__)


class CacheService:
    """In-memory cache service using TTLCache"""
    
    def __init__(self):
        ttl = settings.cache_ttl_seconds
        maxsize = settings.cache_maxsize
        self.books_cache = TTLCache(maxsize=maxsize, ttl=ttl)
        self.categories_cache = TTLCache(maxsize=100, ttl=ttl)
        self.book_cache = TTLCache(maxsize=maxsize, ttl=ttl)
    
    def get_books(self, category: Optional[str] = None) -> Optional[list]:
        """Get books from cache"""
        cache_key = f"books:{category or 'all'}"
        return self.books_cache.get(cache_key)
    
    def set_books(self, category: Optional[str] = None, books: Optional[list] = None):
        """Set books in cache"""
        if books is None:
            return
        cache_key = f"books:{category or 'all'}"
        self.books_cache[cache_key] = books
        logger.info("Cached books", category=category, count=len(books))
    
    def get_categories(self) -> Optional[list]:
        """Get categories from cache"""
        return self.categories_cache.get("categories")
    
    def set_categories(self, categories: list):
        """Set categories in cache"""
        self.categories_cache["categories"] = categories
        logger.info("Cached categories", count=len(categories))
    
    def get_book(self, book_id: int) -> Optional[dict]:
        """Get single book from cache"""
        cache_key = f"book:{book_id}"
        return self.book_cache.get(cache_key)
    
    def set_book(self, book_id: int, book: dict):
        """Set single book in cache"""
        cache_key = f"book:{book_id}"
        self.book_cache[cache_key] = book
        logger.info("Cached book", book_id=book_id)
    
    def invalidate_books(self):
        """Invalidate all books cache"""
        self.books_cache.clear()
        logger.info("Invalidated books cache")
    
    def invalidate_book(self, book_id: int):
        """Invalidate specific book cache"""
        cache_key = f"book:{book_id}"
        if cache_key in self.book_cache:
            del self.book_cache[cache_key]
            logger.info("Invalidated book cache", book_id=book_id)
    
    def invalidate_categories(self):
        """Invalidate categories cache"""
        self.categories_cache.clear()
        logger.info("Invalidated categories cache")
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        return {
            "books_cache_size": len(self.books_cache),
            "categories_cache_size": len(self.categories_cache),
            "book_cache_size": len(self.book_cache)
        }


# Global cache service instance
cache_service = CacheService()
