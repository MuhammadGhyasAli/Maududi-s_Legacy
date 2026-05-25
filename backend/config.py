from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Any


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # API Configuration
    google_api_key: str
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
    database_url: str = "sqlite:///./maududi_legacy.db"
    

    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._validate_settings()
    
    def _validate_settings(self):
        """Validate required settings"""
        if not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required")



settings = Settings()
