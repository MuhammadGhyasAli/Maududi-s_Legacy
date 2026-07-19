import logging
from typing import Optional, List, Dict, Any

from models.book import OrchestrationResult

logger = logging.getLogger(__name__)


class ResearcherAgent:
    def retrieve(
        self,
        orchestration: OrchestrationResult,
        book_id: Optional[int] = None,
        rag_context: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if rag_context and rag_context != "No relevant context found.":
            return [{"text": rag_context, "metadata": {"source": "rag_preloaded"}}]

        logger.warning("No retriever available, returning empty context")
        return []
