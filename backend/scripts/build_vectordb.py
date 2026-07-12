#!/usr/bin/env python3
"""
Build vector database for all books.

Usage:
    python scripts/build_vectordb.py

This script will:
1. Load book data from books.py
2. Download PDFs from external URLs
3. Extract text using Unstructured.io API
4. Chunk text with Urdu-aware splitting
5. Generate embeddings using BGE-M3
6. Store in Chroma Cloud
"""

import sys
import asyncio
import structlog
from pathlib import Path
from typing import List, Dict, Any

sys.path.insert(0, str(Path(__file__).parent.parent))

from data.books import BOOKS_DATA
from services.vector_db.config import VectorDBConfig
from services.vector_db.pdf_processor import PDFProcessor
from services.vector_db.chunker import TextChunker
from services.vector_db.embedder import EmbeddingService
from services.vector_db.vector_store import VectorStore

logger = structlog.get_logger()
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)


class VectorDBBuilder:
    """Builds vector database for all books."""

    def __init__(self):
        VectorDBConfig.validate()
        self.pdf_processor = PDFProcessor()
        self.chunker = TextChunker()
        self.embedder = EmbeddingService()
        self.vector_store = VectorStore()

    async def build_book(self, book: Dict[str, Any]) -> bool:
        """Build vector DB for a single book."""
        book_id = book["id"]
        title = book["title"]
        pdf_url = book.get("pdfUrl", "")

        logger.info("Building vector DB for book", book_id=book_id, title=title)

        if not pdf_url:
            logger.warning("No PDF URL for book", book_id=book_id, title=title)
            return False

        try:
            text = await self.pdf_processor.process_book(book_id, pdf_url)

            if not text or not text.strip():
                logger.warning("No text extracted", book_id=book_id, title=title)
                return False

            chunks = self.chunker.chunk_text(text, book_id, title)

            if not chunks:
                logger.warning("No chunks created", book_id=book_id, title=title)
                return False

            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = self.embedder.embed_texts(chunk_texts)

            self.vector_store.add_documents(book_id, chunks, embeddings)

            stats = self.vector_store.get_collection_stats(book_id)
            logger.info(
                "Book vector DB built successfully",
                book_id=book_id,
                title=title,
                stats=stats,
            )

            return True

        except Exception as e:
            logger.error(
                "Error building vector DB for book",
                book_id=book_id,
                title=title,
                error=str(e),
            )
            return False

    async def build_all(self, book_ids: List[int] = None) -> Dict[str, Any]:
        """Build vector DB for all books or specific books."""
        books = BOOKS_DATA
        if book_ids:
            books = [b for b in books if b["id"] in book_ids]

        results = {"success": [], "failed": [], "skipped": []}

        for book in books:
            book_id = book["id"]
            title = book["title"]

            try:
                stats = self.vector_store.get_collection_stats(book_id)
                if stats.get("count", 0) > 0:
                    logger.info(
                        "Book already exists, skipping",
                        book_id=book_id,
                        title=title,
                    )
                    results["skipped"].append(book_id)
                    continue
            except Exception:
                pass

            success = await self.build_book(book)
            if success:
                results["success"].append(book_id)
            else:
                results["failed"].append(book_id)

        return results

    def cleanup(self):
        """Clean up downloaded PDFs."""
        self.pdf_processor.cleanup()


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Build vector database for books")
    parser.add_argument(
        "--book-ids",
        nargs="+",
        type=int,
        help="Specific book IDs to process (default: all)",
    )
    parser.add_argument("--cleanup", action="store_true", help="Clean up PDFs after")

    args = parser.parse_args()

    builder = VectorDBBuilder()

    logger.info("Starting vector DB build")
    results = await builder.build_all(args.book_ids)

    logger.info(
        "Build completed",
        success=len(results["success"]),
        failed=len(results["failed"]),
        skipped=len(results["skipped"]),
    )

    if args.cleanup:
        builder.cleanup()
        logger.info("Cleanup completed")

    return results


if __name__ == "__main__":
    results = asyncio.run(main())
    print("\n" + "=" * 50)
    print("BUILD RESULTS")
    print("=" * 50)
    print(f"Success: {len(results['success'])} books")
    print(f"Failed: {len(results['failed'])} books")
    print(f"Skipped: {len(results['skipped'])} books")
    if results["failed"]:
        print(f"\nFailed book IDs: {results['failed']}")
