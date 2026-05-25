from pymongo.database import Database
from typing import List, Optional
from models.db_models import BookModel
from models.book import Book, BookResponse
from database import get_next_id
from services.cache_service import cache_service


class BookRepository:
    def __init__(self, db: Database):
        self.db = db

    def _doc_to_model(self, doc: dict) -> Optional[BookModel]:
        if not doc:
            return None
        return BookModel(
            id=doc["id"],
            title=doc["title"],
            author=doc["author"],
            description=doc["description"],
            image_url=doc["image_url"],
            pdf_url=doc["pdf_url"],
            ai_context=doc["ai_context"],
            publication_year=doc["publication_year"],
            category=doc["category"],
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at"),
        )

    def get_all_books(self, category: Optional[str] = None, use_cache: bool = True) -> List[BookModel]:
        if use_cache:
            cached = cache_service.get_books(category)
            if cached:
                return cached

        query = {}
        if category and category != "All":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        docs = list(self.db.books.find(query).sort("id", 1))
        books = [self._doc_to_model(d) for d in docs]

        if use_cache:
            cache_service.set_books(category, books)

        return books

    def get_book_by_id(self, book_id: int, use_cache: bool = True) -> Optional[BookModel]:
        if use_cache:
            cached = cache_service.get_book(book_id)
            if cached:
                return cached

        doc = self.db.books.find_one({"id": book_id})
        book = self._doc_to_model(doc)

        if use_cache and book:
            cache_service.set_book(book_id, book)

        return book

    def get_books_by_category(self, category: str, use_cache: bool = True) -> List[BookModel]:
        if category == "All":
            return self.get_all_books(use_cache=use_cache)
        return self.get_all_books(category, use_cache=use_cache)

    def create_book(self, book_data: dict) -> BookModel:
        book_data["id"] = get_next_id("books")
        self.db.books.insert_one(book_data)

        cache_service.invalidate_books()
        cache_service.invalidate_categories()

        return self._doc_to_model(book_data)

    def update_book(self, book_id: int, book_data: dict) -> Optional[BookModel]:
        doc = self.db.books.find_one({"id": book_id})
        if not doc:
            return None
        self.db.books.update_one({"id": book_id}, {"$set": book_data})
        cache_service.invalidate_book(book_id)
        cache_service.invalidate_books()
        return self.get_book_by_id(book_id, use_cache=False)

    def delete_book(self, book_id: int) -> bool:
        result = self.db.books.delete_one({"id": book_id})
        if result.deleted_count:
            cache_service.invalidate_book(book_id)
            cache_service.invalidate_books()
            cache_service.invalidate_categories()
            return True
        return False

    def get_categories(self, use_cache: bool = True) -> List[str]:
        if use_cache:
            cached = cache_service.get_categories()
            if cached:
                return cached

        pipeline = [{"$group": {"_id": "$category"}}, {"$sort": {"_id": 1}}]
        result = self.db.books.aggregate(pipeline)
        categories = [r["_id"] for r in result]

        if use_cache:
            cache_service.set_categories(categories)

        return categories

    def to_pydantic(self, book_model: BookModel) -> Book:
        return Book(
            id=book_model.id,
            title=book_model.title,
            author=book_model.author,
            description=book_model.description,
            imageUrl=book_model.image_url,
            pdfUrl=book_model.pdf_url,
            aiContext=book_model.ai_context,
            publicationYear=book_model.publication_year,
            category=book_model.category,
        )
