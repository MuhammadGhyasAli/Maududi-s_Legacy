import structlog
from typing import List, Dict, Any, Optional

from .embedder import EmbeddingService
from .vector_store import VectorStore

logger = structlog.get_logger()


class RetrieverService:
    """Retrieves relevant context from vector store for chat integration."""

    def __init__(self):
        self.embedder = EmbeddingService()
        self.vector_store = VectorStore()

    def retrieve_context(
        self,
        query: str,
        book_id: Optional[int] = None,
        n_results: int = 5,
    ) -> str:
        """Retrieve relevant context for a query."""
        query_embedding = self.embedder.embed_query(query)

        if book_id:
            results = self.vector_store.query_book(
                book_id=book_id,
                query_embedding=query_embedding,
                n_results=n_results,
            )
        else:
            results = self.vector_store.query_all_books(
                query_embedding=query_embedding,
                n_results=n_results,
            )

        return self.format_context(results)

    def retrieve_with_metadata(
        self,
        query: str,
        book_id: Optional[int] = None,
        n_results: int = 5,
    ) -> List[Dict[str, Any]]:
        """Retrieve context with full metadata."""
        query_embedding = self.embedder.embed_query(query)

        if book_id:
            return self.vector_store.query_book(
                book_id=book_id,
                query_embedding=query_embedding,
                n_results=n_results,
            )
        else:
            return self.vector_store.query_all_books(
                query_embedding=query_embedding,
                n_results=n_results,
            )

    def format_context(self, results: List[Dict[str, Any]]) -> str:
        """Format retrieved results into context string for LLM."""
        if not results:
            return "No relevant context found."

        context_parts = []
        for i, result in enumerate(results, 1):
            text = result.get("text", "")
            metadata = result.get("metadata", {})
            book_title = metadata.get("book_title", "Unknown")
            chunk_index = metadata.get("chunk_index", 0)

            context_parts.append(
                f"[Source {i}: {book_title}, Chunk {chunk_index + 1}]\n{text}"
            )

        return "\n\n".join(context_parts)

    def get_book_stats(self, book_id: int) -> Dict[str, Any]:
        """Get vector store stats for a book."""
        return self.vector_store.get_collection_stats(book_id)
