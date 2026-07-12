import logging

from services.groq_service import groq_service as _groq_service

logger = logging.getLogger(__name__)


ACCURACY_INSTRUCTION = (
    "\n\nCRITICAL ACCURACY RULES:\n"
    "1. Only state facts you are highly confident about. Never fabricate or guess.\n"
    "2. If you are unsure about a detail, explicitly say so instead of speculating.\n"
    "3. Cite exact book titles and specific references when available.\n"
    "4. A concise, correct answer is far better than a lengthy speculative one.\n"
    "5. Quality over quantity — prioritize factual precision over comprehensiveness."
)

RAG_INSTRUCTION = (
    "\n\nRETRIEVED CONTEXT:\n"
    "The following passages have been retrieved from Maududi's works using semantic search. "
    "Use this context to inform your answer when relevant. If the context is helpful, "
    "cite the source book title. If the context does not help answer the question, "
    "rely on your general knowledge but say so.\n\n"
    "{context}"
)


class LLMService:
    def generate_response(
        self,
        system_instruction: str,
        messages: list[dict],
        rag_context: str | None = None,
    ) -> str:
        enhanced_instruction = system_instruction if system_instruction else ""
        if rag_context and rag_context != "No relevant context found.":
            enhanced_instruction += RAG_INSTRUCTION.format(context=rag_context)
        enhanced_instruction += ACCURACY_INSTRUCTION
        result = _groq_service.chat(enhanced_instruction, messages)
        if result.get("error"):
            raise RuntimeError(f"Groq failed: {result.get('message')}")
        return result["response"]


llm_service = LLMService()
