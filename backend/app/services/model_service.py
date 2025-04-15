from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import ModelCreate, ModelResponse, ModelList
from app.models.models import Model
import os
import uuid
import shutil
import logging

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self, db: Session):
        self.db = db

    def create_model(self, model_data: ModelCreate) -> Model:
        """Tworzy nowy model w bazie danych"""
        try:
            new_model = Model(
                name=model_data.name,
                description=model_data.description,
                model_type=model_data.model_type,
                framework=model_data.framework,
                version=model_data.version,
                status="created",
                config=model_data.config
            )
            self.db.add(new_model)
            self.db.commit()
            self.db.refresh(new_model)
            return new_model
        except Exception as e:
            logger.error(f"Błąd podczas tworzenia modelu: {str(e)}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia modelu: {str(e)}")

    def get_model(self, model_id: int) -> Model:
        """Pobiera model po ID"""
        model = self.db.query(Model).filter(Model.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model nie znaleziony")
        return model

    def get_models(self, skip: int = 0, limit: int = 100) -> List[Model]:
        """Pobiera listę modeli"""
        return self.db.query(Model).offset(skip).limit(limit).all()

    def update_model(self, model_id: int, model_data: dict) -> Model:
        """Aktualizuje model"""
        model = self.get_model(model_id)
        for key, value in model_data.items():
            if hasattr(model, key):
                setattr(model, key, value)
        
        self.db.commit()
        self.db.refresh(model)
        return model

    def delete_model(self, model_id: int) -> bool:
        """Usuwa model"""
        model = self.get_model(model_id)
        self.db.delete(model)
        self.db.commit()
        return True
