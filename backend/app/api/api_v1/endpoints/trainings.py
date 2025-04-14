from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.training_service import TrainingService
from app.schemas.schemas import TrainingCreate, TrainingResponse, TrainingsResponse

router = APIRouter()

@router.post("/", response_model=TrainingResponse)
def create_training(
    training: TrainingCreate,
    db: Session = Depends(get_db)
):
    """
    Rozpoczyna nowy proces trenowania modelu.
    """
    return TrainingService.create_training(db, training)

@router.get("/", response_model=TrainingsResponse)
def get_trainings(
    model_id: Optional[int] = None,
    dataset_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę procesów trenowania.
    """
    return TrainingService.get_trainings(db, model_id, dataset_id, status, skip, limit)

@router.get("/{training_id}", response_model=TrainingResponse)
def get_training(
    training_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera proces trenowania o podanym ID.
    """
    return TrainingService.get_training(db, training_id)

@router.delete("/{training_id}", response_model=TrainingResponse)
def cancel_training(
    training_id: int,
    db: Session = Depends(get_db)
):
    """
    Anuluje proces trenowania o podanym ID.
    """
    return TrainingService.cancel_training(db, training_id)

@router.get("/{training_id}/progress")
def get_training_progress(
    training_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera postęp procesu trenowania.
    """
    return TrainingService.get_training_progress(db, training_id)

@router.get("/{training_id}/metrics")
def get_training_metrics(
    training_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera metryki procesu trenowania.
    """
    return TrainingService.get_training_metrics(db, training_id)
