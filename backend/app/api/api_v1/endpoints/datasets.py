from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.dataset_service import DatasetService
from app.schemas.schemas import DatasetCreate, DatasetResponse, DatasetsResponse

router = APIRouter()

@router.post("/", response_model=DatasetResponse)
def create_dataset(
    dataset: DatasetCreate,
    db: Session = Depends(get_db)
):
    """
    Tworzy nowy zbiór danych.
    """
    return DatasetService.create_dataset(db, dataset)

@router.get("/", response_model=DatasetsResponse)
def get_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę zbiorów danych.
    """
    return DatasetService.get_datasets(db, skip, limit)

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera zbiór danych o podanym ID.
    """
    return DatasetService.get_dataset(db, dataset_id)

@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: int,
    dataset: DatasetCreate,
    db: Session = Depends(get_db)
):
    """
    Aktualizuje zbiór danych o podanym ID.
    """
    return DatasetService.update_dataset(db, dataset_id, dataset)

@router.delete("/{dataset_id}", response_model=DatasetResponse)
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa zbiór danych o podanym ID.
    """
    return DatasetService.delete_dataset(db, dataset_id)

@router.get("/{dataset_id}/stats")
def get_dataset_with_stats(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera zbiór danych wraz ze statystykami.
    """
    return DatasetService.get_dataset_with_stats(db, dataset_id)

@router.post("/{dataset_id}/images", response_model=DatasetResponse)
def add_images_to_dataset(
    dataset_id: int,
    image_ids: List[int] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Dodaje obrazy do zbioru danych.
    """
    return DatasetService.add_images_to_dataset(db, dataset_id, image_ids)

@router.delete("/{dataset_id}/images", response_model=DatasetResponse)
def remove_images_from_dataset(
    dataset_id: int,
    image_ids: List[int] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Usuwa obrazy ze zbioru danych.
    """
    return DatasetService.remove_images_from_dataset(db, dataset_id, image_ids)
