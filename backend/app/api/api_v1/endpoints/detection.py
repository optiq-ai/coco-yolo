from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import DetectionCreate, DetectionResponse, DetectionList
from app.services.detection_service import DetectionService
from app.worker.tasks import process_detection
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=dict)
def create_detection(
    image_id: int = Form(...),
    model_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """Tworzy nowe zadanie detekcji obiektów"""
    try:
        # Uruchom zadanie asynchroniczne
        task = process_detection.delay(image_id, model_id)
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Rozpoczęto detekcję obiektów dla obrazu {image_id} z modelem {model_id}"
        }
    except Exception as e:
        logger.error(f"Błąd podczas tworzenia zadania detekcji: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia zadania detekcji: {str(e)}")

@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera zadanie detekcji po ID"""
    detection_service = DetectionService(db)
    return detection_service.get_detection(detection_id)

@router.get("/", response_model=DetectionList)
def get_detections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobiera listę zadań detekcji"""
    detection_service = DetectionService(db)
    detections = detection_service.get_detections(skip, limit)
    return {"items": detections, "total": len(detections)}

@router.delete("/{detection_id}", response_model=bool)
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa zadanie detekcji"""
    detection_service = DetectionService(db)
    return detection_service.delete_detection(detection_id)
