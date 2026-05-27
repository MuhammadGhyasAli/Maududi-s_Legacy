import os
import httpx
from typing import List, Optional


GROQ_API_BASE = "https://api.groq.com/openai/v1"
GROQ_MODEL_TEXT = os.environ.get("GROQ_MODEL_TEXT", "llama-3.3-70b-versatile")
GROQ_MODEL_VISION = os.environ.get("GROQ_MODEL_VISION", "llama-3.2-11b-vision-preview")


class GroqService:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY") or ""

    async def chat(self, system_instruction: str, messages: List[dict]) -> dict:
        api_key = self.api_key or os.environ.get("GROQ_API_KEY")
        if not api_key:
            return {"error": True, "message": "GROQ_API_KEY not set"}

        try:
            formatted_messages = [{"role": "system", "content": system_instruction}]

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

                formatted_messages.append({"role": role, "content": content})

            model = GROQ_MODEL_VISION if has_image else GROQ_MODEL_TEXT

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{GROQ_API_BASE}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
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
