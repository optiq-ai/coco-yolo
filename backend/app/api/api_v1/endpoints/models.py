from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.model_service import ModelService
from app.schemas.schemas import ModelCreate, ModelResponse, ModelsResponse

router = APIRouter()

@router.post("/", response_model=ModelResponse)
def create_model(
    model: ModelCreate,
    db: Session = Depends(get_db)
):
    """
    Tworzy nowy model.
    """
    return ModelService.create_model(db, model)

@router.get("/", response_model=ModelsResponse)
def get_models(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę modeli.
    """
    return ModelService.get_models(db, skip, limit)

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera model o podanym ID.
    """
    return ModelService.get_model(db, model_id)

@router.delete("/{model_id}", response_model=ModelResponse)
def delete_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa model o podanym ID.
    """
    return ModelService.delete_model(db, model_id)

@router.get("/{model_id}/download")
def get_model_download_url(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Generuje URL do pobrania modelu.
    """
    return ModelService.get_model_download_url(db, model_id)

@router.get("/{model_id}/metrics")
def get_model_metrics(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera metryki modelu.
    """
    return ModelService.get_model_metrics(db, model_id)
