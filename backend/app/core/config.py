import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Signature Validator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = "SUPER_SECRET_KEY_DIGITAL_SIGNATURE_VALIDATOR_2026_SECURE_DEV"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./signature_validator.db")
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = 20
    ALLOWED_EXTENSIONS: set = {".pdf"}
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://signature-vallidator.vercel.app",
    ]

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
