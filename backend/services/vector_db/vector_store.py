import structlog
from typing import List, Dict, Any, Optional

from .config import VectorDBConfig
from .chroma_http import ChromaHTTPClient

logger = structlog.get_logger()


class VectorStore:
    """Manages Chroma Cloud vector store operations via HTTP API."""

    def __init__(self):
        self.config = VectorDBConfig()
        self._client = None

    @property
    def client(self) -> ChromaHTTPClient:
        """Lazy load the Chroma Cloud HTTP client."""
        if self._client is None:
            logger.info(
                "Connecting to Chroma Cloud",
                tenant=self.config.CHROMA_TENANT,
                database=self.config.CHROMA_DATABASE,
            )
            self._client = ChromaHTTPClient(
                tenant=self.config.CHROMA_TENANT,
                database=self.config.CHROMA_DATABASE,
                api_key=self.config.CHROMA_API_KEY,
            )
            logger.info("Connected to Chroma Cloud successfully")
        return self._client

    def get_or_create_collection(self, book_id: int) -> str:
        """Get or create a collection for a book. Returns collection name."""
        collection_name = self.config.get_collection_name(book_id)
        self.client.get_or_create_collection(
            name=collection_name,
            metadata={"book_id": book_id},
        )
        count = self.client.count(collection_name)
        logger.info("Collection ready", collection=collection_name, count=count)
        return collection_name

    def add_documents(
        self,
        book_id: int,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> None:
        """Add documents to a book's collection."""
        collection_name = self.get_or_create_collection(book_id)

        ids = [f"chunk_{book_id}_{i}" for i in range(len(chunks))]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        self.client.add(
            collection_name=collection_name,
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        logger.info("Documents added to collection", book_id=book_id, count=len(chunks))

    def query_book(
        self,
        book_id: int,
        query_embedding: List[float],
        n_results: int = 5,
    ) -> List[Dict[str, Any]]:
        """Query a specific book's collection."""
        collection_name = self.config.get_collection_name(book_id)

        try:
            results = self.client.query(
                collection_name=collection_name,
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
        except Exception as e:
            logger.warning("Query failed", book_id=book_id, error=str(e))
            return []

        formatted_results = []
        if results and results.get("documents"):
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append(
                    {
                        "text": doc,
                        "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
                        "distance": results["distances"][0][i] if results.get("distances") else 0,
                    }
                )

        return formatted_results

    def query_all_books(
        self,
        query_embedding: List[float],
        n_results: int = 10,
        book_ids: Optional[List[int]] = None,
    ) -> List[Dict[str, Any]]:
        """Query across all books or specific books."""
        collections = self.client.list_collections()

        all_results = []
        for coll in collections:
            try:
                coll_name = coll.get("name", "")
                # Extract book_id from collection name (book_N)
                if not coll_name.startswith("book_"):
                    continue
                bid = int(coll_name.split("_")[1])
                if book_ids and bid not in book_ids:
                    continue

                results = self.query_book(bid, query_embedding, n_results)
                all_results.extend(results)
            except Exception as e:
                logger.warning("Error querying collection", collection=coll.get("name"), error=str(e))

        all_results.sort(key=lambda x: x.get("distance", float("inf")))
        return all_results[:n_results]

    def get_collection_stats(self, book_id: int) -> Dict[str, Any]:
        """Get statistics for a book's collection."""
        try:
            collection_name = self.config.get_collection_name(book_id)
            count = self.client.count(collection_name)
            return {
                "book_id": book_id,
                "collection_name": collection_name,
                "count": count,
            }
        except Exception as e:
            return {
                "book_id": book_id,
                "error": str(e),
            }

    def delete_book(self, book_id: int) -> bool:
        """Delete a book's collection."""
        try:
            collection_name = self.config.get_collection_name(book_id)
            self.client.delete_collection(collection_name)
            logger.info("Collection deleted", collection=collection_name)
            return True
        except Exception as e:
            logger.error("Error deleting collection", book_id=book_id, error=str(e))
            return False
