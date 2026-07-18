import json
import re
import logging
from typing import Optional

from models.book import OrchestrationResult
from services.groq_service import groq_service
from config import settings

logger = logging.getLogger(__name__)

ORCHESTRATOR_SYSTEM_PROMPT = (
    "You are a query classifier for an AI assistant about Sayyid Abul A'la Maududi's works. "
    "Analyze the user's message and return a JSON object.\n\n"
    "Return EXACTLY this JSON structure (no markdown, no explanation, just raw JSON):\n"
    "{\n"
    '  "intent": "<one of: direct_quote, summary, factual_question, comparison, greeting, off_topic>",\n'
    '  "query_strategy": "<how to search the knowledge base for this query>",\n'
    '  "target_topic": "<the core concept or topic to search for>",\n'
    '  "search_keywords": ["<keyword1>", "<keyword2>", "<keyword3>"]\n'
    "}\n\n"
    "Classification rules:\n"
    '- "greeting": hello, hi, salam, thanks, salutations, or simple pleasantries\n'
    '- "off_topic": questions completely unrelated to Maududi, Islam, or his works\n'
    '- "direct_quote": user wants a specific quote or passage from a book\n'
    '- "summary": user wants a summary of a concept, chapter, or book\n'
    '- "factual_question": user asks a specific factual question about Maududi\'s views or works\n'
    '- "comparison": user wants to compare two concepts, books, or ideas\n\n'
    "For greetings and off_topic, include a \"short_circuit_response\" field with a friendly reply.\n"
    "For real queries, provide useful search_keywords that capture the essence of what to look for.\n\n"
    "Respond ONLY with the JSON object. No additional text."
)

SHORT_CIRCUIT_GREETING = (
    "Wa Alaikum Assalam! I'm the Maududi AI Assistant. I can help you explore "
    "the life, works, and thoughts of Sayyid Abul A'la Maududi. What would you like to know?"
)

SHORT_CIRCUIT_OFF_TOPIC = (
    "I appreciate your question, but I'm specifically designed to help with "
    "Sayyid Abul A'la Maududi's works and Islamic scholarship. "
    "Could you ask something related to his books or teachings?"
)


class OrchestratorAgent:
    def classify(self, user_message: str, language: str = "English") -> OrchestrationResult:
        result = groq_service.chat(ORCHESTRATOR_SYSTEM_PROMPT, [{"role": "user", "content": user_message}])

        if result.get("error"):
            logger.warning("Orchestrator LLM failed, defaulting to factual_question", error=result.get("message"))
            return OrchestrationResult(
                intent="factual_question",
                query_strategy=user_message,
                target_topic=user_message,
                search_keywords=user_message.split()[:5],
            )

        raw = result["response"]
        parsed = self._parse_json(raw)

        if not parsed:
            logger.warning("Orchestrator returned invalid JSON, defaulting to factual_question")
            return OrchestrationResult(
                intent="factual_question",
                query_strategy=user_message,
                target_topic=user_message,
                search_keywords=user_message.split()[:5],
            )

        intent = parsed.get("intent", "factual_question")

        if intent == "greeting":
            return OrchestrationResult(
                intent="greeting",
                query_strategy="",
                target_topic="",
                short_circuit_response=SHORT_CIRCUIT_GREETING,
            )

        if intent == "off_topic":
            return OrchestrationResult(
                intent="off_topic",
                query_strategy="",
                target_topic="",
                short_circuit_response=SHORT_CIRCUIT_OFF_TOPIC,
            )

        return OrchestrationResult(
            intent=intent,
            query_strategy=parsed.get("query_strategy", user_message),
            target_topic=parsed.get("target_topic", user_message),
            search_keywords=parsed.get("search_keywords", []),
        )

    def _parse_json(self, text: str) -> Optional[dict]:
        text = text.strip()

        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return None

        json_str = match.group(0)

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            cleaned = re.sub(r",\s*}", "}", json_str)
            cleaned = re.sub(r",\s*]", "]", cleaned)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return None
