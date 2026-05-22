import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "adam-edu"
    SECRET_KEY: str = "change-me-in-production-use-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = "sqlite:///./adam-edu.db"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 100

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@adam-edu.kz"

    FRONTEND_URL: str = "http://localhost:5173"
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
