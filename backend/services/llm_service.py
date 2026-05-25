from typing import List, Dict
from structlog import get_logger
from services.groq_service import groq_service
from exceptions import ExternalServiceException

logger = get_logger(__name__)

class LLMService:
    async def generate_response(self, context: str, messages: List[Dict[str, str]]) -> str:
        """
        Generate a response using available LLM services.
        Uses Groq exclusively.
        """
        try:
            response = await groq_service.chat(context, messages)
            logger.info("Chat response generated successfully with Groq")
            return response
        except Exception as groq_e:
            logger.error(f"Groq failed. Error: {str(groq_e)}")
            raise ExternalServiceException(
                "Failed to generate AI response", 
                details=f"Groq Error: {str(groq_e)}"
            )

# Singleton instance
llm_service = LLMService()
