import os
from groq import Groq
from typing import List

from config import settings

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or ""
        if not self.api_key:
            # We don't raise error on init to allow the app to start
            # but it will fail when chat is called if still not set
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            
    def chat(self, system_instruction: str, messages: List[dict]) -> dict:
        """Send chat request to Groq"""
        if not self.client:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                return {"error": True, "message": "GROQ_API_KEY not set"}
            self.client = Groq(api_key=api_key)

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

            completion = self.client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                temperature=0.1,
                max_tokens=4096,
                top_p=0.9,
            )

            return {"response": completion.choices[0].message.content}
        except Exception as e:
            return {"error": True, "message": f"Groq Error: {str(e)}"}

groq_service = GroqService()
