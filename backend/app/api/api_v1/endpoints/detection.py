from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.detection_service import DetectionService
from app.schemas.schemas import DetectionCreate, DetectionResponse, DetectionsResponse

router = APIRouter()

@router.post("/", response_model=DetectionResponse)
def create_detection(
    detection: DetectionCreate,
    db: Session = Depends(get_db)
):
    """
    Wykonuje detekcję obiektów na obrazie.
    """
    return DetectionService.create_detection(db, detection)

@router.get("/", response_model=DetectionsResponse)
def get_detections(
    image_id: Optional[int] = None,
    model_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę detekcji.
    """
    return DetectionService.get_detections(db, image_id, model_id, skip, limit)

@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera detekcję o podanym ID.
    """
    return DetectionService.get_detection(db, detection_id)

@router.delete("/{detection_id}", response_model=DetectionResponse)
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa detekcję o podanym ID.
    """
    return DetectionService.delete_detection(db, detection_id)
