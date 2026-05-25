import os
from groq import Groq
from typing import List

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            # We don't raise error on init to allow the app to start
            # but it will fail when chat is called if still not set
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            
    async def chat(self, system_instruction: str, messages: List[dict]) -> str:
        """Send chat request to Groq"""
        if not self.client:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable not set")
            self.client = Groq(api_key=api_key)
            
        try:
            # Groq uses standard OpenAI message format
            # We must insert the system instruction as the first message
            formatted_messages = [
                {"role": "system", "content": system_instruction}
            ]
            
            has_image = False
            
            # Append all user/assistant messages
            for msg in messages:
                role = msg.get("role", "user")
                if role.lower() == "ai" or role.lower() == "model":
                    role = "assistant"
                elif role.lower() == "user":
                    role = "user"
                
                content = msg.get("content", "")
                
                # Check for images to switch model
                if isinstance(content, list):
                    for part in content:
                        if part.get("type") == "image_url":
                            has_image = True
                            
                formatted_messages.append({
                    "role": role,
                    "content": content
                })

            # llama-3.2-11b-vision-preview supports vision
            model = "llama-3.2-11b-vision-preview" if has_image else "llama-3.3-70b-versatile"

            completion = self.client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                temperature=0.7,
                max_tokens=2048,
                top_p=1,
            )
            
            return completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error calling Groq API: {str(e)}")

groq_service = GroqService()
