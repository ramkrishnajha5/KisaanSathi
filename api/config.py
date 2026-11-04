from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Pydantic settings loaded from environment or .env file."""
    model_config = ConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "KisaanSathi"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./kisaansathi.db"
    MODEL_PATH: str = "ml/models/kisaansathi_mobilenetv2.keras"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.60

    # External APIs (Optional placeholders)
    OPENWEATHERMAP_API_KEY: Optional[str] = None
    DATA_GOV_IN_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None


settings = Settings()
