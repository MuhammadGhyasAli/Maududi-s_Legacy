import logging

from services.gemini_service import GeminiService
from services.groq_service import GroqService

logger = logging.getLogger(__name__)

groq_service = GroqService()
gemini_service = GeminiService()


ACCURACY_INSTRUCTION = (
    "\n\nCRITICAL ACCURACY RULES:\n"
    "1. Only state facts you are highly confident about. Never fabricate or guess.\n"
    "2. If you are unsure about a detail, explicitly say so instead of speculating.\n"
    "3. Cite exact book titles and specific references when available.\n"
    "4. A concise, correct answer is far better than a lengthy speculative one.\n"
    "5. Quality over quantity — prioritize factual precision over comprehensiveness."
)


class LLMService:
    def generate_response(self, system_instruction: str, messages: list[dict]) -> str:
        enhanced_instruction = system_instruction + ACCURACY_INSTRUCTION if system_instruction else ACCURACY_INSTRUCTION
        for name, service in [("Gemini", gemini_service), ("Groq", groq_service)]:
            try:
                result = service.chat(enhanced_instruction, messages)
                if result.get("error"):
                    logger.warning("%s failed: %s", name, result.get("message"))
                    continue
                return result["response"]
            except Exception as e:
                logger.warning("%s error: %s", name, e)
                continue
        raise RuntimeError("All AI providers failed to generate a response")


llm_service = LLMService()
