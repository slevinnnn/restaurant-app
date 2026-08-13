"""
Configuración de la aplicación
"""
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Configuración global de la aplicación"""
    
    # App
    APP_NAME: str = "Restaurant Order System"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/restaurant_db"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Hosts permitidos
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Socket.IO
    SOCKETIO_CORS_ALLOWED_ORIGINS: List[str] = ALLOWED_ORIGINS
    
    # Restaurant Config
    RESTAURANT_ID: str = os.getenv("RESTAURANT_ID", "restaurant_1")
    RESTAURANT_NAME: str = os.getenv("RESTAURANT_NAME", "Mi Restaurant")
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instancia global de settings
settings = Settings()
