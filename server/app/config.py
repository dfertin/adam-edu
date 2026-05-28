import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "adam-edu"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = "sqlite:///./learn.db"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    SEED_ADMIN_EMAIL: str = "admin@example.com"
    SEED_ADMIN_NAME: str = "Admin"
    SEED_ADMIN_PASSWORD: str = ""
    SEED_USER_EMAIL: str = "user@example.com"
    SEED_USER_NAME: str = "Test User"
    SEED_USER_PASSWORD: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
