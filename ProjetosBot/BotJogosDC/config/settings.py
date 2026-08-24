import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DISCORD_TOKEN: str = ""
    CLIENT_ID: str = ""

    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/data/game_deals.db"

    CHECK_INTERVAL_MINUTES: int = 30
    MIN_DISCOUNT: float = 50.0
    EXTREME_DISCOUNT: float = 80.0
    PREFERRED_CURRENCY: str = "BRL"

    # Fallback default global channels if not configured per guild
    CHANNEL_FREE_GAMES: str = ""
    CHANNEL_DEALS: str = ""
    CHANNEL_BIG_DEALS: str = ""
    CHANNEL_NEW_OFFERS: str = ""
    CHANNEL_EXPIRED: str = ""

    WEB_HOST: str = "0.0.0.0"
    WEB_PORT: int = 8000
    SECRET_KEY: str = "default_secret_key_change_in_production"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
(BASE_DIR / "data").mkdir(exist_ok=True)
(BASE_DIR / "logs").mkdir(exist_ok=True)
