import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class VectorDBConfig:
    # Chroma Cloud settings
    CHROMA_API_KEY: str = os.getenv("CHROMA_API_KEY", "")
    CHROMA_TENANT: str = os.getenv("CHROMA_TENANT", "526e989c-61dc-4d10-a0a2-8fb5b3015d68")
    CHROMA_DATABASE: str = os.getenv("CHROMA_DATABASE", "maududi-work")
    CHROMA_HOST: str = os.getenv("CHROMA_HOST", "api.trychroma.com")

    # Embedding model settings
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIMENSION: int = 384

    # Chunking settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    # PDF processing settings
    UNSTRUCTURED_API_KEY: str = os.getenv("UNSTRUCTURED_API_KEY", "")
    UNSTRUCTURED_API_URL: str = os.getenv(
        "UNSTRUCTURED_API_URL", "https://api.unstructured.io"
    )
    PDF_DOWNLOAD_DIR: str = os.getenv("PDF_DOWNLOAD_DIR", "./temp_pdfs")

    # Collection naming
    COLLECTION_PREFIX: str = "book_"

    @classmethod
    def get_collection_name(cls, book_id: int) -> str:
        """Get collection name for a book."""
        return f"{cls.COLLECTION_PREFIX}{book_id}"

    @classmethod
    def validate(cls) -> bool:
        """Validate required config values."""
        required = ["CHROMA_API_KEY", "UNSTRUCTURED_API_KEY"]
        for field in required:
            if not getattr(cls, field):
                raise ValueError(f"Missing required config: {field}")
        return True
