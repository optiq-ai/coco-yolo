from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.session import get_db, engine, Base
from app.services.minio_service import minio_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Konfiguracja CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Dołączenie routera API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    # Utworzenie tabel w bazie danych
    Base.metadata.create_all(bind=engine)
    
    # Utworzenie bucketów w MinIO
    minio_service.create_buckets()

@app.get("/")
def read_root():
    return {"message": "YOLO-COCO Object Detection API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
