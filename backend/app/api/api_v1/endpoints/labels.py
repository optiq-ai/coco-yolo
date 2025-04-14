from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.label_service import LabelService
from app.schemas.schemas import LabelCreate, LabelResponse, LabelsResponse

router = APIRouter()

@router.post("/", response_model=LabelResponse)
def create_label(
    label: LabelCreate,
    db: Session = Depends(get_db)
):
    """
    Tworzy nową etykietę dla obrazu.
    """
    return LabelService.create_label(db, label)

@router.get("/", response_model=LabelsResponse)
def get_labels(
    image_id: Optional[int] = None,
    class_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę etykiet.
    """
    return LabelService.get_labels(db, image_id, class_id, skip, limit)

@router.get("/{label_id}", response_model=LabelResponse)
def get_label(
    label_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera etykietę o podanym ID.
    """
    return LabelService.get_label(db, label_id)

@router.put("/{label_id}", response_model=LabelResponse)
def update_label(
    label_id: int,
    label: LabelCreate,
    db: Session = Depends(get_db)
):
    """
    Aktualizuje etykietę o podanym ID.
    """
    return LabelService.update_label(db, label_id, label)

@router.delete("/{label_id}", response_model=LabelResponse)
def delete_label(
    label_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa etykietę o podanym ID.
    """
    return LabelService.delete_label(db, label_id)

@router.post("/batch", response_model=LabelsResponse)
def create_multiple_labels(
    labels: List[LabelCreate],
    db: Session = Depends(get_db)
):
    """
    Tworzy wiele etykiet jednocześnie.
    """
    return LabelService.create_multiple_labels(db, labels)
