from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import TrainingCreate, TrainingResponse, TrainingList
from app.services.training_service import TrainingService
from app.worker.tasks import train_model
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=dict)
def create_training(
    training_data: TrainingCreate,
    db: Session = Depends(get_db)
):
    """Tworzy nowe zadanie trenowania modelu"""
    try:
        # Najpierw zapisz zadanie w bazie danych
        training_service = TrainingService(db)
        training = training_service.create_training(training_data)
        
        # Uruchom zadanie asynchroniczne
        task = train_model.delay(training.id)
        
        return {
            "task_id": task.id,
            "training_id": training.id,
            "status": "started",
            "message": f"Rozpoczęto trenowanie modelu {training.model_id} na datasecie {training.dataset_id}"
        }
    except Exception as e:
        logger.error(f"Błąd podczas tworzenia zadania trenowania: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia zadania trenowania: {str(e)}")

@router.get("/{training_id}", response_model=TrainingResponse)
def get_training(
    training_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera zadanie trenowania po ID"""
    training_service = TrainingService(db)
    return training_service.get_training(training_id)

@router.get("/", response_model=TrainingList)
def get_trainings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobiera listę zadań trenowania"""
    training_service = TrainingService(db)
    trainings = training_service.get_trainings(skip, limit)
    return {"items": trainings, "total": len(trainings)}

@router.delete("/{training_id}", response_model=bool)
def delete_training(
    training_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa zadanie trenowania"""
    training_service = TrainingService(db)
    return training_service.delete_training(training_id)
