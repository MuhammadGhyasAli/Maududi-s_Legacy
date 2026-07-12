from .config import VectorDBConfig

__all__ = [
    "VectorDBConfig",
]


def __getattr__(name):
    """Lazy imports to avoid loading heavy dependencies at import time."""
    if name == "PDFProcessor":
        from .pdf_processor import PDFProcessor
        return PDFProcessor
    elif name == "TextChunker":
        from .chunker import TextChunker
        return TextChunker
    elif name == "EmbeddingService":
        from .embedder import EmbeddingService
        return EmbeddingService
    elif name == "VectorStore":
        from .vector_store import VectorStore
        return VectorStore
    elif name == "RetrieverService":
        from .retriever import RetrieverService
        return RetrieverService
    elif name == "ChromaHTTPClient":
        from .chroma_http import ChromaHTTPClient
        return ChromaHTTPClient
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
