import logging
from typing import Optional, List, Dict, Any

from models.book import OrchestrationResult

logger = logging.getLogger(__name__)

_retriever = None


def _get_retriever():
    global _retriever
    if _retriever is None:
        try:
            from services.vector_db.retriever import RetrieverService
            _retriever = RetrieverService()
        except Exception as e:
            logger.warning("Vector DB retriever unavailable for researcher agent", error=str(e))
            _retriever = False
    return _retriever if _retriever is not False else None


class ResearcherAgent:
    def retrieve(
        self,
        orchestration: OrchestrationResult,
        book_id: Optional[int] = None,
        rag_context: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if rag_context and rag_context != "No relevant context found.":
            return [{"text": rag_context, "metadata": {"source": "rag_preloaded"}}]

        retriever = _get_retriever()
        if not retriever:
            logger.warning("No retriever available, returning empty context")
            return []

        search_query = self._build_search_query(orchestration)

        n_results = self._get_n_results(orchestration.intent)

        try:
            results = retriever.retrieve_with_metadata(
                query=search_query,
                book_id=book_id,
                n_results=n_results,
            )
            logger.info(
                "Researcher retrieved chunks",
                intent=orchestration.intent,
                n_results=len(results),
            )
            return results
        except Exception as e:
            logger.error("Researcher retrieval failed", error=str(e))
            return []

    def _build_search_query(self, orchestration: OrchestrationResult) -> str:
        parts = []

        if orchestration.target_topic:
            parts.append(orchestration.target_topic)

        if orchestration.search_keywords:
            parts.append(" ".join(orchestration.search_keywords))

        if orchestration.query_strategy and orchestration.query_strategy != orchestration.target_topic:
            parts.append(orchestration.query_strategy)

        return " ".join(parts) if parts else orchestration.target_topic

    def _get_n_results(self, intent: str) -> int:
        n_map = {
            "direct_quote": 8,
            "summary": 6,
            "factual_question": 5,
            "comparison": 8,
        }
        return n_map.get(intent, 5)
