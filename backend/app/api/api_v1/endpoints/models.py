from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import ModelCreate, ModelResponse, ModelList
from app.services.model_service import ModelService
from app.worker.tasks import export_model
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ModelResponse)
def create_model(
    model_data: ModelCreate,
    db: Session = Depends(get_db)
):
    """Tworzy nowy model"""
    model_service = ModelService(db)
    return model_service.create_model(model_data)

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera model po ID"""
    model_service = ModelService(db)
    return model_service.get_model(model_id)

@router.get("/", response_model=ModelList)
def get_models(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobiera listę modeli"""
    model_service = ModelService(db)
    models = model_service.get_models(skip, limit)
    return {"items": models, "total": len(models)}

@router.put("/{model_id}", response_model=ModelResponse)
def update_model(
    model_id: int,
    model_data: ModelCreate,
    db: Session = Depends(get_db)
):
    """Aktualizuje model"""
    model_service = ModelService(db)
    return model_service.update_model(model_id, model_data.dict())

@router.delete("/{model_id}", response_model=bool)
def delete_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa model"""
    model_service = ModelService(db)
    return model_service.delete_model(model_id)

@router.post("/{model_id}/export", response_model=dict)
def export_model_endpoint(
    model_id: int,
    format: str = Query(..., description="Format eksportu (onnx, tflite, itp.)"),
    db: Session = Depends(get_db)
):
    """Eksportuje model do określonego formatu"""
    model_service = ModelService(db)
    model = model_service.get_model(model_id)
    
    # Uruchom zadanie asynchroniczne
    task = export_model.delay(model_id, format)
    
    return {
        "task_id": task.id,
        "status": "started",
        "message": f"Rozpoczęto eksport modelu {model_id} do formatu {format}"
    }
