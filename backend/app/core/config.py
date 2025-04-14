import os
from pydantic import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "YOLO-COCO Object Detection API"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/yolo_coco")
    
    # MinIO
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "minioadmin")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
    MINIO_URL: str = os.getenv("MINIO_URL", "minio:9000")
    MINIO_SECURE: bool = False
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI Models
    MODELS_BUCKET: str = "models"
    IMAGES_BUCKET: str = "images"
    DATASETS_BUCKET: str = "datasets"
    TEMP_BUCKET: str = "temp"
    
    # Default values
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.5
    DEFAULT_NMS_THRESHOLD: float = 0.45
    DEFAULT_MAX_DETECTIONS: int = 100
    
    # Training
    DEFAULT_EPOCHS: int = 100
    DEFAULT_BATCH_SIZE: int = 16
    DEFAULT_LEARNING_RATE: float = 0.001
    DEFAULT_IMAGE_SIZE: int = 640
    
    class Config:
        case_sensitive = True

settings = Settings()
