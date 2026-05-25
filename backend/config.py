from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Any
import os


# Determine the best .env file location
_env_file = os.path.join(os.path.dirname(__file__), ".env")
if not os.path.isfile(_env_file):
    _env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
_env_file = os.path.abspath(_env_file)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # API Configuration
    google_api_key: str
    groq_api_key: str = ""
    port: int = 8000

    # CORS Configuration
    cors_origins: Any = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator('cors_origins', mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(',') if i.strip()]
        return v
    
    # Database Configuration
    mongodb_url: str = ""
    mongodb_db_name: str = "maududi_legacy"
    
    
    
    # JWT Configuration
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    
    # Cache Configuration
    cache_ttl_seconds: int = 300
    cache_maxsize: int = 1000

    # Google OAuth (separate from Gemini API key)
    google_oauth_client_id: str = ""

    # Password Reset
    password_reset_ttl_minutes: int = 30
    dev_return_password_reset_token: bool = False

    # AI Model Configuration
    gemini_model: str = "gemini-2.0-flash"
    groq_model_text: str = "llama-3.3-70b-versatile"
    groq_model_vision: str = "llama-3.2-11b-vision-preview"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._validate_settings()
    
    def _validate_settings(self):
        """Validate required settings"""
        if not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required")



settings = Settings()
