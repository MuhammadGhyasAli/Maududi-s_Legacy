import structlog
from typing import List
import numpy as np

from .config import VectorDBConfig

logger = structlog.get_logger()


class EmbeddingService:
    """Handles text embedding using ChromaDB's default embedding function."""

    def __init__(self):
        self.config = VectorDBConfig()
        self._embed_fn = None

    @property
    def embed_fn(self):
        """Lazy load the embedding function."""
        if self._embed_fn is None:
            import chromadb.utils.embedding_functions as ef
            logger.info("Loading ChromaDB default embedding function")
            self._embed_fn = ef.DefaultEmbeddingFunction()
            logger.info("Embedding function loaded")
        return self._embed_fn

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts."""
        if not texts:
            return []

        logger.info("Embedding texts", count=len(texts))
        embeddings = self.embed_fn(texts)
        logger.info("Texts embedded successfully", count=len(texts))
        return embeddings

    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        if not query or not query.strip():
            raise ValueError("Empty query")
        embedding = self.embed_fn([query])
        return embedding[0]

    def get_dimension(self) -> int:
        """Get the embedding dimension."""
        return 384
