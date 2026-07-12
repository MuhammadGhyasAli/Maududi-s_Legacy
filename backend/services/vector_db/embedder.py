import structlog
from typing import List

logger = structlog.get_logger()


class EmbeddingService:
    """Handles text embedding using fastembed (ONNX-based, no torch needed)."""

    def __init__(self):
        self._model = None
        self._model_name = "sentence-transformers/all-MiniLM-L6-v2"

    @property
    def model(self):
        """Lazy load the embedding model."""
        if self._model is None:
            from fastembed import TextEmbedding
            logger.info("Loading fastembed model", model=self._model_name)
            self._model = TextEmbedding(self._model_name)
            logger.info("fastembed model loaded")
        return self._model

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts."""
        if not texts:
            return []

        logger.info("Embedding texts", count=len(texts))
        embeddings = list(self.model.embed(texts))
        logger.info("Texts embedded successfully", count=len(texts))
        return [e.tolist() for e in embeddings]

    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        if not query or not query.strip():
            raise ValueError("Empty query")
        embedding = list(self.model.embed([query]))
        return embedding[0].tolist()

    def get_dimension(self) -> int:
        """Get the embedding dimension."""
        return 384
