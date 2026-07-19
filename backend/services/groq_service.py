import os
import httpx
from typing import List, Optional

from config import settings

GROQ_API_BASE = "https://api.groq.com/openai/v1"


class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or ""
        self._client: Optional[httpx.Client] = None
        self._async_client: Optional[httpx.AsyncClient] = None

    def _get_client(self) -> Optional[httpx.Client]:
        if self._client is not None:
            return self._client
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            self.api_key = ""
            return None
        self.api_key = api_key
        proxy = os.getenv("HTTP_PROXY") or os.getenv("HTTPS_PROXY") or None
        client_kwargs = {
            "base_url": GROQ_API_BASE,
            "headers": {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            "timeout": 30.0,
        }
        if proxy:
            client_kwargs["proxy"] = proxy
        self._client = httpx.Client(**client_kwargs)
        return self._client

    async def _get_async_client(self) -> Optional[httpx.AsyncClient]:
        if self._async_client is not None:
            return self._async_client
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            self.api_key = ""
            return None
        self.api_key = api_key
        proxy = os.getenv("HTTP_PROXY") or os.getenv("HTTPS_PROXY") or None
        client_kwargs = {
            "base_url": GROQ_API_BASE,
            "headers": {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            "timeout": 30.0,
        }
        if proxy:
            client_kwargs["proxy"] = proxy
        self._async_client = httpx.AsyncClient(**client_kwargs)
        return self._async_client

    def _build_messages(self, system_instruction: str, messages: List[dict]) -> tuple[list, bool]:
        formatted_messages = [{"role": "system", "content": system_instruction}]
        has_image = False
        for msg in messages:
            role = msg.get("role", "user")
            if role.lower() in ("ai", "model"):
                role = "assistant"
            content = msg.get("content", "")
            if isinstance(content, list):
                for part in content:
                    if part.get("type") == "image_url":
                        has_image = True
            formatted_messages.append({"role": role, "content": content})
        return formatted_messages, has_image

    def chat(self, system_instruction: str, messages: List[dict]) -> dict:
        client = self._get_client()
        if not client:
            return {"error": True, "message": "GROQ_API_KEY not set"}
        try:
            formatted_messages, has_image = self._build_messages(system_instruction, messages)
            model = settings.groq_model_vision if has_image else settings.groq_model_text
            response = client.post(
                "/chat/completions",
                json={"model": model, "messages": formatted_messages, "temperature": 0.1, "max_tokens": 4096, "top_p": 0.9},
            )
            response.raise_for_status()
            data = response.json()
            return {"response": data["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"error": True, "message": f"Groq Error: {str(e)}"}

    async def achat(self, system_instruction: str, messages: List[dict]) -> dict:
        client = await self._get_async_client()
        if not client:
            return {"error": True, "message": "GROQ_API_KEY not set"}
        try:
            formatted_messages, has_image = self._build_messages(system_instruction, messages)
            model = settings.groq_model_vision if has_image else settings.groq_model_text
            response = await client.post(
                "/chat/completions",
                json={"model": model, "messages": formatted_messages, "temperature": 0.1, "max_tokens": 4096, "top_p": 0.9},
            )
            response.raise_for_status()
            data = response.json()
            return {"response": data["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"error": True, "message": f"Groq Error: {str(e)}"}


groq_service = GroqService()
