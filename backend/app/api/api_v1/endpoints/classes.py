from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.models import ObjectClass
from app.schemas.schemas import ObjectClassCreate, ObjectClass as ObjectClassSchema

router = APIRouter()

@router.post("/", response_model=ObjectClassSchema)
def create_class(
    class_data: ObjectClassCreate,
    db: Session = Depends(get_db)
):
    """
    Tworzy nową klasę obiektów.
    """
    try:
        # Sprawdzenie, czy klasa o takiej nazwie już istnieje
        existing_class = db.query(ObjectClass).filter(ObjectClass.name == class_data.name).first()
        if existing_class:
            raise HTTPException(status_code=400, detail=f"Klasa o nazwie '{class_data.name}' już istnieje")
        
        # Utworzenie nowej klasy
        db_class = ObjectClass(
            name=class_data.name,
            color=class_data.color,
            description=class_data.description
        )
        
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        
        return db_class
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas tworzenia klasy: {str(e)}")

@router.get("/", response_model=List[ObjectClassSchema])
def get_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Pobiera listę klas obiektów.
    """
    try:
        classes = db.query(ObjectClass).offset(skip).limit(limit).all()
        return classes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania klas: {str(e)}")

@router.get("/{class_id}", response_model=ObjectClassSchema)
def get_class(
    class_id: int,
    db: Session = Depends(get_db)
):
    """
    Pobiera klasę o podanym ID.
    """
    try:
        db_class = db.query(ObjectClass).filter(ObjectClass.id == class_id).first()
        if not db_class:
            raise HTTPException(status_code=404, detail=f"Klasa o ID {class_id} nie została znaleziona")
        
        return db_class
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania klasy: {str(e)}")

@router.put("/{class_id}", response_model=ObjectClassSchema)
def update_class(
    class_id: int,
    class_data: ObjectClassCreate,
    db: Session = Depends(get_db)
):
    """
    Aktualizuje klasę o podanym ID.
    """
    try:
        db_class = db.query(ObjectClass).filter(ObjectClass.id == class_id).first()
        if not db_class:
            raise HTTPException(status_code=404, detail=f"Klasa o ID {class_id} nie została znaleziona")
        
        # Sprawdzenie, czy inna klasa o takiej nazwie już istnieje
        existing_class = db.query(ObjectClass).filter(
            ObjectClass.name == class_data.name,
            ObjectClass.id != class_id
        ).first()
        
        if existing_class:
            raise HTTPException(status_code=400, detail=f"Inna klasa o nazwie '{class_data.name}' już istnieje")
        
        # Aktualizacja klasy
        db_class.name = class_data.name
        db_class.color = class_data.color
        db_class.description = class_data.description
        
        db.commit()
        db.refresh(db_class)
        
        return db_class
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas aktualizacji klasy: {str(e)}")

@router.delete("/{class_id}", response_model=ObjectClassSchema)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db)
):
    """
    Usuwa klasę o podanym ID.
    """
    try:
        db_class = db.query(ObjectClass).filter(ObjectClass.id == class_id).first()
        if not db_class:
            raise HTTPException(status_code=404, detail=f"Klasa o ID {class_id} nie została znaleziona")
        
        # Usunięcie klasy
        db.delete(db_class)
        db.commit()
        
        return db_class
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas usuwania klasy: {str(e)}")
