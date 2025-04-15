from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import TrainingCreate, TrainingResponse, TrainingList
from app.models.models import Training
import os
import uuid
import shutil
import logging
from app.ai_engines.training_engine import TrainingEngine

logger = logging.getLogger(__name__)

class TrainingService:
    def __init__(self, db: Session):
        self.db = db
        self.training_engine = TrainingEngine()

    def create_training(self, training_data: TrainingCreate) -> Training:
        """Tworzy nowe zadanie trenowania w bazie danych"""
        try:
            new_training = Training(
                name=training_data.name,
                description=training_data.description,
                dataset_id=training_data.dataset_id,
                model_id=training_data.model_id,
                config=training_data.config,
                status="created"
            )
            self.db.add(new_training)
            self.db.commit()
            self.db.refresh(new_training)
            return new_training
        except Exception as e:
            logger.error(f"Błąd podczas tworzenia zadania trenowania: {str(e)}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia zadania trenowania: {str(e)}")

    def get_training(self, training_id: int) -> Training:
        """Pobiera zadanie trenowania po ID"""
        training = self.db.query(Training).filter(Training.id == training_id).first()
        if not training:
            raise HTTPException(status_code=404, detail="Zadanie trenowania nie znalezione")
        return training

    def get_trainings(self, skip: int = 0, limit: int = 100) -> List[Training]:
        """Pobiera listę zadań trenowania"""
        return self.db.query(Training).offset(skip).limit(limit).all()

    def update_training(self, training_id: int, training_data: dict) -> Training:
        """Aktualizuje zadanie trenowania"""
        training = self.get_training(training_id)
        for key, value in training_data.items():
            if hasattr(training, key):
                setattr(training, key, value)
        
        self.db.commit()
        self.db.refresh(training)
        return training

    def delete_training(self, training_id: int) -> bool:
        """Usuwa zadanie trenowania"""
        training = self.get_training(training_id)
        self.db.delete(training)
        self.db.commit()
        return True
        
    def process_training(self, training_id: int) -> dict:
        """Przetwarza zadanie trenowania"""
        training = self.get_training(training_id)
        
        # Aktualizacja statusu
        self.update_training(training_id, {"status": "processing"})
        
        try:
            # Tutaj logika trenowania modelu
            result = self.training_engine.train(
                training_id=training_id,
                dataset_id=training.dataset_id,
                model_id=training.model_id,
                config=training.config
            )
            
            # Aktualizacja statusu i wyników
            self.update_training(training_id, {
                "status": "completed",
                "results": result
            })
            
            return result
        except Exception as e:
            logger.error(f"Błąd podczas trenowania: {str(e)}")
            self.update_training(training_id, {"status": "failed", "error": str(e)})
            raise HTTPException(status_code=500, detail=f"Błąd podczas trenowania: {str(e)}")
