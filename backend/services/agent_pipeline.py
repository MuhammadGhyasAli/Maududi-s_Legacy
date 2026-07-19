import json
import logging
import re
from typing import Optional, AsyncGenerator, Any

from models.book import OrchestrationResult
from services.agents.orchestrator import OrchestratorAgent
from services.agents.researcher import ResearcherAgent
from services.agents.synthesizer import synthesizer_agent
from services.llm_service import llm_service

logger = logging.getLogger(__name__)


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _parse_follow_ups(text: str) -> tuple[str, list[str]]:
    pattern = r"### Follow-up Questions\s*\n((?:\u2022\s*.+\n?)*)"
    match = re.search(pattern, text, re.MULTILINE)
    questions: list[str] = []
    if match:
        block = match.group(1)
        questions = [
            q.strip().lstrip("\u2022 ").strip()
            for q in block.strip().split("\n")
            if q.strip().startswith("\u2022 ")
        ]
        text = text[: match.start()].strip()
    return text, questions


FOLLOW_UP_PROMPT = (
    "\n\nAfter answering, suggest 2-3 brief follow-up questions the user might ask next. "
    "Format them as a bullet list under a '### Follow-up Questions' heading. "
    "Each should start with '\u2022 ' and be a complete question. Do not number them."
)


class AgentPipeline:
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.researcher = ResearcherAgent()

    async def run_stream(
        self,
        user_message: str,
        messages: list[dict],
        system_context: str,
        book_id: Optional[int] = None,
        rag_context: Optional[str] = None,
        language: str = "English",
        conversation_id: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        try:
            yield _sse_event("agent_status", {
                "agent": "orchestrator",
                "message": "Understanding your question...",
            })

            orchestration = await self.orchestrator.classify(user_message, language)
            logger.info("Orchestrator classified", intent=orchestration.intent, topic=orchestration.target_topic)

            if orchestration.short_circuit_response:
                yield _sse_event("agent_status", {
                    "agent": "orchestrator",
                    "message": "Done",
                    "done": True,
                })
                full_text = orchestration.short_circuit_response
                for word in full_text.split(" "):
                    yield _sse_event("token", {"token": word + " "})
                yield _sse_event("done", {
                    "conversationId": conversation_id,
                    "followUpQuestions": [],
                })
                return

            yield _sse_event("agent_status", {
                "agent": "researcher",
                "message": "Searching through Maududi's works...",
            })

            chunks = self.researcher.retrieve(orchestration, book_id=book_id, rag_context=rag_context)

            yield _sse_event("agent_status", {
                "agent": "researcher",
                "message": "Done",
                "done": True,
                "chunksFound": len(chunks),
            })

            if not chunks:
                logger.warning("Researcher found no chunks, falling back to single call")
                async for event in self._fallback_stream(messages, system_context, language, conversation_id):
                    yield event
                return

            yield _sse_event("agent_status", {
                "agent": "synthesizer",
                "message": "Composing your answer...",
            })

            enhanced_question = user_message
            if language and language != "English":
                enhanced_question += f"\n\nIMPORTANT: Respond entirely in {language}."

            full_response = ""
            async for token in synthesizer_agent.synthesize_stream(
                question=enhanced_question,
                orchestration=orchestration,
                chunks=chunks,
                language=language,
            ):
                full_response += token
                yield _sse_event("token", {"token": token})

            clean_text, follow_ups = _parse_follow_ups(full_response)

            yield _sse_event("done", {
                "conversationId": conversation_id,
                "followUpQuestions": follow_ups,
            })

        except Exception as e:
            logger.error("Agent pipeline failed, falling back", error=str(e))
            yield _sse_event("agent_status", {
                "agent": "synthesizer",
                "message": "Retrying with fallback...",
            })
            async for event in self._fallback_stream(messages, system_context, language, conversation_id):
                yield event

    async def _fallback_stream(
        self,
        messages: list[dict],
        system_context: str,
        language: str,
        conversation_id: Optional[int],
    ) -> AsyncGenerator[str, None]:
        try:
            response_text = await llm_service.agenerate_response(system_context, messages)
            clean_text, follow_ups = _parse_follow_ups(response_text)

            for word in clean_text.split(" "):
                yield _sse_event("token", {"token": word + " "})

            yield _sse_event("done", {
                "conversationId": conversation_id,
                "followUpQuestions": follow_ups,
            })
        except Exception as e:
            logger.error("Fallback also failed", error=str(e))
            yield _sse_event("error", {"message": "Service temporarily unavailable. Please try again."})


agent_pipeline = AgentPipeline()
