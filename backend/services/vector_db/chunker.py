import structlog
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import VectorDBConfig

logger = structlog.get_logger()


class TextChunker:
    """Splits text into embedding-ready chunks with Urdu-aware splitting."""

    def __init__(self):
        self.config = VectorDBConfig()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.CHUNK_SIZE,
            chunk_overlap=self.config.CHUNK_OVERLAP,
            length_function=len,
            separators=[
                "\n\n",  # Paragraph breaks (highest priority)
                "\n",  # Line breaks
                "۔",  # Urdu sentence terminator (full stop)
                "!",  # Exclamation
                "?",  # Question mark
                "؛",  # Arabic semicolon
                ":",  # Colon
                "،",  # Urdu comma
                ",",  # English comma
                " ",  # Space (lowest priority)
            ],
        )

    def chunk_text(
        self, text: str, book_id: int, book_title: str = ""
    ) -> List[Dict[str, Any]]:
        """Split text into chunks with metadata."""
        if not text or not text.strip():
            logger.warning("Empty text provided for chunking", book_id=book_id)
            return []

        logger.info(
            "Chunking text",
            book_id=book_id,
            characters=len(text),
            estimated_words=len(text.split()),
        )

        chunks = self.splitter.split_text(text)

        chunk_docs = []
        for i, chunk in enumerate(chunks):
            if chunk.strip():  # Skip empty chunks
                chunk_docs.append(
                    {
                        "text": chunk,
                        "metadata": {
                            "book_id": book_id,
                            "book_title": book_title,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                        },
                    }
                )

        logger.info(
            "Text chunked successfully",
            book_id=book_id,
            total_chunks=len(chunk_docs),
        )

        return chunk_docs

    def chunk_with_page_numbers(
        self,
        text: str,
        book_id: int,
        book_title: str = "",
        page_number: int = 1,
    ) -> List[Dict[str, Any]]:
        """Split text into chunks with page number tracking."""
        if not text or not text.strip():
            return []

        chunks = self.splitter.split_text(text)

        chunk_docs = []
        for i, chunk in enumerate(chunks):
            if chunk.strip():
                chunk_docs.append(
                    {
                        "text": chunk,
                        "metadata": {
                            "book_id": book_id,
                            "book_title": book_title,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                            "page_number": page_number,
                        },
                    }
                )

        return chunk_docs
