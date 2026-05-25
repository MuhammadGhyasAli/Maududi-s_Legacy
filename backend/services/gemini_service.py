import os
import logging

from config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.model_name = settings.gemini_model
        self.client = None
        self._imported = False

    def _ensure_client(self):
        if self._imported:
            return self.client is not None
        self._imported = True
        if not self.api_key:
            return False
        try:
            import google.generativeai as genai

            genai.configure(api_key=self.api_key)
            self.client = genai
            logger.info("Gemini client initialized")
            return True
        except Exception as e:
            logger.warning("Failed to init Gemini: %s", e)
            return False

    def chat(self, system_instruction: str, messages: list[dict]) -> dict:
        if not self._ensure_client():
            return {"error": True, "message": "Gemini not configured"}

        try:
            model = self.client.GenerativeModel(
                self.model_name,
                system_instruction=system_instruction if system_instruction else None,
                generation_config={"temperature": 0.1, "top_p": 0.9, "max_output_tokens": 4096},
            )

            history = []
            user_content = ""
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    user_content = content
                elif role == "assistant" and history:
                    history.append({"role": "user", "parts": [user_content]})
                    history.append({"role": "model", "parts": [content]})
                    user_content = ""

            contents = history
            if user_content:
                contents.append({"role": "user", "parts": [user_content]})

            if not contents:
                return {"error": True, "message": "No user messages found"}

            chat = model.start_chat(history=contents[:-1] if len(contents) > 1 else [])
            last_msg = contents[-1]["parts"][0] if contents[-1]["parts"] else ""

            response = chat.send_message(last_msg)
            return {"response": response.text}

        except Exception as e:
            logger.error("Gemini API error: %s", e)
            return {"error": True, "message": f"Gemini Error: {str(e)}"}
