from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import DatasetCreate, DatasetResponse, DatasetList
from app.models.models import Dataset
import logging
from app.services.dataset_service import DatasetService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=DatasetResponse)
def create_dataset(
    dataset_data: DatasetCreate,
    db: Session = Depends(get_db)
):
    """Tworzy nowy dataset"""
    dataset_service = DatasetService(db)
    return dataset_service.create_dataset(dataset_data)

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera dataset po ID"""
    dataset_service = DatasetService(db)
    return dataset_service.get_dataset(dataset_id)

@router.get("/", response_model=DatasetList)
def get_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobiera listę datasetów"""
    dataset_service = DatasetService(db)
    datasets = dataset_service.get_datasets(skip, limit)
    return {"items": datasets, "total": len(datasets)}

@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: int,
    dataset_data: DatasetCreate,
    db: Session = Depends(get_db)
):
    """Aktualizuje dataset"""
    dataset_service = DatasetService(db)
    return dataset_service.update_dataset(dataset_id, dataset_data.dict())

@router.delete("/{dataset_id}", response_model=bool)
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa dataset"""
    dataset_service = DatasetService(db)
    return dataset_service.delete_dataset(dataset_id)
