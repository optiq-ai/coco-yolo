from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import AnnotationCreate, AnnotationResponse, AnnotationList
from app.models.models import Annotation
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=AnnotationResponse)
def create_label(
    annotation_data: AnnotationCreate,
    db: Session = Depends(get_db)
):
    """Tworzy nową adnotację"""
    try:
        new_annotation = Annotation(
            x=annotation_data.x,
            y=annotation_data.y,
            width=annotation_data.width,
            height=annotation_data.height,
            format=annotation_data.format,
            image_id=annotation_data.image_id,
            class_id=annotation_data.class_id
        )
        db.add(new_annotation)
        db.commit()
        db.refresh(new_annotation)
        return new_annotation
    except Exception as e:
        logger.error(f"Błąd podczas tworzenia adnotacji: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia adnotacji: {str(e)}")

@router.get("/{annotation_id}", response_model=AnnotationResponse)
def get_label(
    annotation_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera adnotację po ID"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Adnotacja nie znaleziona")
    return annotation

@router.get("/", response_model=AnnotationList)
def get_labels(
    skip: int = 0,
    limit: int = 100,
    image_id: Optional[int] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Pobiera listę adnotacji"""
    query = db.query(Annotation)
    
    if image_id is not None:
        query = query.filter(Annotation.image_id == image_id)
    
    if class_id is not None:
        query = query.filter(Annotation.class_id == class_id)
    
    annotations = query.offset(skip).limit(limit).all()
    return {"items": annotations, "total": len(annotations)}

@router.put("/{annotation_id}", response_model=AnnotationResponse)
def update_label(
    annotation_id: int,
    annotation_data: AnnotationCreate,
    db: Session = Depends(get_db)
):
    """Aktualizuje adnotację"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Adnotacja nie znaleziona")
    
    annotation.x = annotation_data.x
    annotation.y = annotation_data.y
    annotation.width = annotation_data.width
    annotation.height = annotation_data.height
    annotation.format = annotation_data.format
    annotation.image_id = annotation_data.image_id
    annotation.class_id = annotation_data.class_id
    
    db.commit()
    db.refresh(annotation)
    return annotation

@router.delete("/{annotation_id}", response_model=bool)
def delete_label(
    annotation_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa adnotację"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Adnotacja nie znaleziona")
    
    db.delete(annotation)
    db.commit()
    return True
