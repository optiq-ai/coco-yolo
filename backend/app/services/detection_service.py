from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import DetectionCreate, DetectionResponse, DetectionList
from app.models.models import Detection, Image
import os
import uuid
import shutil
import logging
import numpy as np
import cv2
from app.ai_engines.training_engine import TrainingEngine

logger = logging.getLogger(__name__)

class DetectionService:
    def __init__(self, db: Session):
        self.db = db
        self.training_engine = TrainingEngine()

    def create_detection(self, detection_data: DetectionCreate) -> Detection:
        """Tworzy nowe zadanie detekcji w bazie danych"""
        try:
            new_detection = Detection(
                image_id=detection_data.image_id,
                model_id=detection_data.model_id,
                status="created"
            )
            self.db.add(new_detection)
            self.db.commit()
            self.db.refresh(new_detection)
            return new_detection
        except Exception as e:
            logger.error(f"Błąd podczas tworzenia zadania detekcji: {str(e)}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia zadania detekcji: {str(e)}")

    def get_detection(self, detection_id: int) -> Detection:
        """Pobiera zadanie detekcji po ID"""
        detection = self.db.query(Detection).filter(Detection.id == detection_id).first()
        if not detection:
            raise HTTPException(status_code=404, detail="Zadanie detekcji nie znalezione")
        return detection

    def get_detections(self, skip: int = 0, limit: int = 100) -> List[Detection]:
        """Pobiera listę zadań detekcji"""
        return self.db.query(Detection).offset(skip).limit(limit).all()

    def update_detection(self, detection_id: int, detection_data: dict) -> Detection:
        """Aktualizuje zadanie detekcji"""
        detection = self.get_detection(detection_id)
        for key, value in detection_data.items():
            if hasattr(detection, key):
                setattr(detection, key, value)
        
        self.db.commit()
        self.db.refresh(detection)
        return detection

    def delete_detection(self, detection_id: int) -> bool:
        """Usuwa zadanie detekcji"""
        detection = self.get_detection(detection_id)
        self.db.delete(detection)
        self.db.commit()
        return True
        
    def process_detection(self, image_id: int, model_id: int) -> dict:
        """Przetwarza zadanie detekcji"""
        # Pobierz obraz
        image = self.db.query(Image).filter(Image.id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Obraz nie znaleziony")
        
        # Utwórz zadanie detekcji
        detection_data = DetectionCreate(image_id=image_id, model_id=model_id)
        detection = self.create_detection(detection_data)
        
        # Aktualizacja statusu
        self.update_detection(detection.id, {"status": "processing"})
        
        try:
            # Tutaj logika detekcji obiektów
            # W rzeczywistej implementacji użylibyśmy modelu YOLO
            # Na potrzeby przykładu zwracamy fikcyjne wyniki
            
            results = {
                "objects": [
                    {"class": "person", "confidence": 0.95, "bbox": [10, 20, 100, 200]},
                    {"class": "car", "confidence": 0.87, "bbox": [150, 30, 250, 180]},
                ],
                "processing_time": 0.45
            }
            
            # Aktualizacja statusu i wyników
            self.update_detection(detection.id, {
                "status": "completed",
                "results": results
            })
            
            return results
        except Exception as e:
            logger.error(f"Błąd podczas detekcji: {str(e)}")
            self.update_detection(detection.id, {"status": "failed", "error": str(e)})
            raise HTTPException(status_code=500, detail=f"Błąd podczas detekcji: {str(e)}")
