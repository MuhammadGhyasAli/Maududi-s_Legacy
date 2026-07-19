import json
import logging
import os
from typing import Optional, AsyncGenerator, List, Dict, Any

import httpx

from config import settings
from models.book import OrchestrationResult

logger = logging.getLogger(__name__)

GROQ_API_BASE = "https://api.groq.com/openai/v1"

INTENT_INSTRUCTIONS = {
    "direct_quote": "The user is looking for a specific quote or passage. Present the most relevant excerpts verbatim, citing the source book.",
    "summary": "The user wants a summary. Synthesize the key themes and arguments from the provided context into a coherent overview.",
    "factual_question": "The user asks a specific factual question. Answer precisely using only the provided context. If the context doesn't contain the answer, say so.",
    "comparison": "The user wants a comparison. Structure your response as a clear comparison, highlighting similarities and differences from the context.",
}


class SynthesizerAgent:
    def build_system_prompt(
        self,
        orchestration: OrchestrationResult,
        language: str = "English",
    ) -> str:
        intent_guide = INTENT_INSTRUCTIONS.get(
            orchestration.intent,
            "Answer the question using only the provided context.",
        )

        return (
            "You are a scholarly editor for the works of Sayyid Abul A'la Maududi. "
            "Your task is to write a clear, well-formatted Markdown response based ONLY on the raw facts below.\n\n"
            f"INTENT: {orchestration.intent}\n"
            f"INSTRUCTION: {intent_guide}\n\n"
            "CRITICAL RULES:\n"
            "1. ONLY use information from the provided context chunks. Do not add external knowledge.\n"
            "2. If the context doesn't fully answer the question, explicitly say so.\n"
            "3. Cite source book titles when referencing specific ideas.\n"
            "4. NEVER fabricate quotes, page numbers, or claims not in the context.\n"
            "5. Format with headers, bullet points, and bold for readability.\n"
            "6. Be scholarly yet accessible.\n\n"
            f"Respond in the same language as the user's question (default: {language})."
        )

    def build_user_prompt(
        self,
        question: str,
        chunks: List[Dict[str, Any]],
    ) -> str:
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            text = chunk.get("text", "")
            metadata = chunk.get("metadata", {})
            book_title = metadata.get("book_title", metadata.get("source", "Unknown"))
            chunk_idx = metadata.get("chunk_index", i)
            context_parts.append(f"[Source {i}: {book_title}, Chunk {chunk_idx + 1}]\n{text}")

        context_block = "\n\n".join(context_parts) if context_parts else "No relevant context found."

        return (
            f"USER QUESTION: {question}\n\n"
            f"RETRIEVED CONTEXT:\n{context_block}\n\n"
            "Write your response based on the above context. Follow the rules in your system prompt."
        )

    async def synthesize_stream(
        self,
        question: str,
        orchestration: OrchestrationResult,
        chunks: List[Dict[str, Any]],
        language: str = "English",
    ) -> AsyncGenerator[str, None]:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")

        system_prompt = self.build_system_prompt(orchestration, language)
        user_prompt = self.build_user_prompt(question, chunks)

        proxy = os.getenv("HTTP_PROXY") or os.getenv("HTTPS_PROXY") or None
        client_kwargs = {
            "base_url": GROQ_API_BASE,
            "headers": {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            "timeout": settings.agent_timeout,
        }
        if proxy:
            client_kwargs["proxy"] = proxy

        async with httpx.AsyncClient(**client_kwargs) as client:
            async with client.stream(
                "POST",
                "/chat/completions",
                json={
                    "model": settings.synthesizer_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 4096,
                    "top_p": 0.9,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue


synthesizer_agent = SynthesizerAgent()
