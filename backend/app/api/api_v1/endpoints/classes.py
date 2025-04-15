from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import ClassCreate, ClassResponse, ClassList
from app.models.models import Class
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ClassResponse)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db)
):
    """Tworzy nową klasę obiektów"""
    try:
        new_class = Class(
            name=class_data.name,
            description=class_data.description,
            color=class_data.color
        )
        db.add(new_class)
        db.commit()
        db.refresh(new_class)
        return new_class
    except Exception as e:
        logger.error(f"Błąd podczas tworzenia klasy: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia klasy: {str(e)}")

@router.get("/{class_id}", response_model=ClassResponse)
def get_class(
    class_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera klasę po ID"""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Klasa nie znaleziona")
    return class_obj

@router.get("/", response_model=ClassList)
def get_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobiera listę klas"""
    classes = db.query(Class).offset(skip).limit(limit).all()
    return {"items": classes, "total": len(classes)}

@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    class_data: ClassCreate,
    db: Session = Depends(get_db)
):
    """Aktualizuje klasę"""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Klasa nie znaleziona")
    
    class_obj.name = class_data.name
    class_obj.description = class_data.description
    class_obj.color = class_data.color
    
    db.commit()
    db.refresh(class_obj)
    return class_obj

@router.delete("/{class_id}", response_model=bool)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db)
):
    """Usuwa klasę"""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Klasa nie znaleziona")
    
    db.delete(class_obj)
    db.commit()
    return True
