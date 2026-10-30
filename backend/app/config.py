import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "WebX-Ray AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./webxray.db"

    # Persistent Storage
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = Path(__file__).resolve().parent.parent / "storage"

    # Security & SSRF
    SECRET_KEY: str = "webxray-ai-secure-encryption-key-32chars"
    SSRF_PROTECTION: bool = True
    ALLOW_PRIVATE_IPS: bool = False
    ALLOWED_DOMAINS: list[str] = []

    # Crawling & Browser Limits
    DEFAULT_MAX_PAGES: int = 25
    DEFAULT_MAX_DEPTH: int = 3
    DEFAULT_TIMEOUT_MS: int = 30000
    CONCURRENT_PAGES: int = 3
    HEADLESS_BROWSER: bool = True

    # AI Configuration (Optional provider keys)
    GEMINI_API_KEY: str = Field(default="", alias="GEMINI_API_KEY")
    OPENAI_API_KEY: str = Field(default="", alias="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str = Field(default="", alias="ANTHROPIC_API_KEY")
    CUSTOM_AI_ENDPOINT: str = Field(default="", alias="CUSTOM_AI_ENDPOINT")
    CUSTOM_AI_KEY: str = Field(default="", alias="CUSTOM_AI_KEY")
    CUSTOM_AI_MODEL: str = Field(default="custom-model", alias="CUSTOM_AI_MODEL")

    # Default Active AI Provider
    DEFAULT_AI_PROVIDER: str = "gemini"  # gemini, openai, anthropic, custom, local

    def get_storage_path(self, *subdirs: str) -> Path:
        target = self.STORAGE_DIR.joinpath(*subdirs)
        target.mkdir(parents=True, exist_ok=True)
        return target

settings = Settings()
