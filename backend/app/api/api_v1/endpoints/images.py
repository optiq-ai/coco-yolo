from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.image_service import ImageService
from app.schemas.schemas import ImageResponse, ImagesResponse

router = APIRouter()

@router.post("/", response_model=ImageResponse)
async def create_image(
    file: UploadFile = File(...),
    dataset_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Przesyła nowy obraz do systemu.
    """
    return await ImageService.create_image(db, file, dataset_id)

@router.get("/", response_model=ImagesResponse)
def get_images(
    dataset_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę obrazów.
    """
    return ImageService.get_images(db, skip, limit, dataset_id)

@router.get("/{image_id}", response_model=ImageResponse)
def get_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera obraz o podanym ID.
    """
    return ImageService.get_image(db, image_id)

@router.delete("/{image_id}", response_model=ImageResponse)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa obraz o podanym ID.
    """
    return ImageService.delete_image(db, image_id)

@router.get("/{image_id}/url")
def get_image_url(
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Generuje URL do obrazu.
    """
    return ImageService.get_image_url(db, image_id)

@router.put("/{image_id}/dataset", response_model=ImageResponse)
def update_image_dataset(
    image_id: int,
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Aktualizuje przypisanie obrazu do zbioru danych.
    """
    return ImageService.update_image_dataset(db, image_id, dataset_id)
