from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import ImageCreate, ImageResponse, ImageList
from app.models.models import Image
import os
import uuid
import shutil
import logging
from app.services.image_service import ImageService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    dataset_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Przesyła nowy obraz"""
    image_service = ImageService(db)
    return await image_service.upload_image(file, dataset_id)

@router.get("/{image_id}", response_model=ImageResponse)
def get_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera obraz po ID"""
    image_service = ImageService(db)
    return image_service.get_image(image_id)

@router.get("/", response_model=ImageList)
def get_images(
    skip: int = 0,
    limit: int = 100,
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Pobiera listę obrazów"""
    image_service = ImageService(db)
    images = image_service.get_images(skip, limit, dataset_id)
    return {"items": images, "total": len(images)}

@router.delete("/{image_id}", response_model=bool)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa obraz"""
    image_service = ImageService(db)
    return image_service.delete_image(image_id)
