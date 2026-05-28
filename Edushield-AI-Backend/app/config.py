# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg://user:password@localhost:5432/edushield_ai"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Models
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Risk Thresholds
    CRITICAL_RISK_THRESHOLD: float = 0.75
    HIGH_RISK_THRESHOLD: float = 0.60
    MODERATE_RISK_THRESHOLD: float = 0.40
    
    # Prediction horizons
    SHORT_TERM_DAYS: int = 30
    MEDIUM_TERM_DAYS: int = 60
    LONG_TERM_DAYS: int = 90
    
    # Model versions
    DROPOUT_MODEL_VERSION: str = "v1.2.0"
    ENGAGEMENT_MODEL_VERSION: str = "v1.1.0"
    
    # Feature importance thresholds
    MIN_FEATURE_IMPORTANCE: float = 0.05
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()