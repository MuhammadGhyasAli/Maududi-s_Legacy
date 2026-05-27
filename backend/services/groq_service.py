import os
import httpx
from typing import List, Optional

from config import settings

GROQ_API_BASE = "https://api.groq.com/openai/v1"

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or ""
        self._client: Optional[httpx.Client] = None

    def _get_client(self):
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

    def chat(self, system_instruction: str, messages: List[dict]) -> dict:
        """Send chat request to Groq via direct HTTP call"""
        client = self._get_client()
        if not client:
            return {"error": True, "message": "GROQ_API_KEY not set"}

        try:
            formatted_messages = [
                {"role": "system", "content": system_instruction}
            ]

            has_image = False

            for msg in messages:
                role = msg.get("role", "user")
                if role.lower() in ("ai", "model"):
                    role = "assistant"
                elif role.lower() == "user":
                    role = "user"

                content = msg.get("content", "")

                if isinstance(content, list):
                    for part in content:
                        if part.get("type") == "image_url":
                            has_image = True

                formatted_messages.append({
                    "role": role,
                    "content": content
                })

            model = settings.groq_model_vision if has_image else settings.groq_model_text

            response = client.post(
                "/chat/completions",
                json={
                    "model": model,
                    "messages": formatted_messages,
                    "temperature": 0.1,
                    "max_tokens": 4096,
                    "top_p": 0.9,
                },
            )
            response.raise_for_status()
            data = response.json()
            return {"response": data["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"error": True, "message": f"Groq Error: {str(e)}"}

groq_service = GroqService()
