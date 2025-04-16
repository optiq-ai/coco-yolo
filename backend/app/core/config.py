import os
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator
from typing import Optional, Dict, Any, List

class Settings(BaseSettings):
    # Podstawowe ustawienia aplikacji
    PROJECT_NAME: str = "YOLO-COCO"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    
    # Ustawienia bazy danych
    DATABASE_URL: Optional[PostgresDsn] = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/yolo_coco")
    
    # Ustawienia Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # Ustawienia MinIO
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "minioadmin")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
    MINIO_URL: str = os.getenv("MINIO_URL", "minio:9000")
    
    # Ustawienia CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Katalogi
    UPLOAD_DIR: str = "/app/uploads"
    MODELS_DIR: str = "/app/models"
    DATASETS_DIR: str = "/app/datasets"
    
    # Ustawienia YOLO
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.5
    DEFAULT_IOU_THRESHOLD: float = 0.45
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
