from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
from typing import List, Optional, Dict, Any

from app.models.models import Label, Image, ObjectClass
from app.schemas.schemas import LabelCreate, LabelResponse, LabelsResponse

class LabelService:
    @staticmethod
    def create_label(db: Session, label: LabelCreate) -> LabelResponse:
        """
        Tworzy nową etykietę dla obrazu.
        """
        try:
            # Sprawdzenie, czy obraz istnieje
            image = db.query(Image).filter(Image.id == label.image_id).first()
            if not image:
                return LabelResponse(
                    success=False,
                    message=f"Obraz o ID {label.image_id} nie został znaleziony"
                )
            
            # Sprawdzenie, czy klasa istnieje
            object_class = db.query(ObjectClass).filter(ObjectClass.id == label.class_id).first()
            if not object_class:
                return LabelResponse(
                    success=False,
                    message=f"Klasa o ID {label.class_id} nie została znaleziona"
                )
            
            # Konwersja współrzędnych do formatu JSON
            coordinates_json = json.dumps(label.coordinates)
            
            # Utworzenie etykiety
            db_label = Label(
                image_id=label.image_id,
                class_id=label.class_id,
                type=label.type,
                coordinates=coordinates_json,
                confidence=label.confidence
            )
            
            db.add(db_label)
            db.commit()
            db.refresh(db_label)
            
            # Oznaczenie obrazu jako oznaczonego
            image.is_labeled = True
            db.commit()
            
            return LabelResponse(
                success=True,
                message="Etykieta została pomyślnie utworzona",
                data=db_label
            )
        except Exception as e:
            return LabelResponse(
                success=False,
                message=f"Błąd podczas tworzenia etykiety: {str(e)}"
            )
    
    @staticmethod
    def get_labels(db: Session, image_id: Optional[int] = None, class_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> LabelsResponse:
        """
        Pobiera listę etykiet.
        """
        try:
            query = db.query(Label)
            
            if image_id is not None:
                query = query.filter(Label.image_id == image_id)
            
            if class_id is not None:
                query = query.filter(Label.class_id == class_id)
            
            total = query.count()
            labels = query.offset(skip).limit(limit).all()
            
            # Konwersja współrzędnych z formatu JSON
            for label in labels:
                label.coordinates = json.loads(label.coordinates)
            
            return LabelsResponse(
                success=True,
                message=f"Znaleziono {len(labels)} etykiet",
                data=labels,
                total=total
            )
        except Exception as e:
            return LabelsResponse(
                success=False,
                message=f"Błąd podczas pobierania etykiet: {str(e)}"
            )
    
    @staticmethod
    def get_label(db: Session, label_id: int) -> LabelResponse:
        """
        Pobiera etykietę o podanym ID.
        """
        try:
            label = db.query(Label).filter(Label.id == label_id).first()
            
            if not label:
                return LabelResponse(
                    success=False,
                    message=f"Etykieta o ID {label_id} nie została znaleziona"
                )
            
            # Konwersja współrzędnych z formatu JSON
            label.coordinates = json.loads(label.coordinates)
            
            return LabelResponse(
                success=True,
                message="Etykieta została znaleziona",
                data=label
            )
        except Exception as e:
            return LabelResponse(
                success=False,
                message=f"Błąd podczas pobierania etykiety: {str(e)}"
            )
    
    @staticmethod
    def update_label(db: Session, label_id: int, label: LabelCreate) -> LabelResponse:
        """
        Aktualizuje etykietę o podanym ID.
        """
        try:
            db_label = db.query(Label).filter(Label.id == label_id).first()
            
            if not db_label:
                return LabelResponse(
                    success=False,
                    message=f"Etykieta o ID {label_id} nie została znaleziona"
                )
            
            # Sprawdzenie, czy obraz istnieje
            image = db.query(Image).filter(Image.id == label.image_id).first()
            if not image:
                return LabelResponse(
                    success=False,
                    message=f"Obraz o ID {label.image_id} nie został znaleziony"
                )
            
            # Sprawdzenie, czy klasa istnieje
            object_class = db.query(ObjectClass).filter(ObjectClass.id == label.class_id).first()
            if not object_class:
                return LabelResponse(
                    success=False,
                    message=f"Klasa o ID {label.class_id} nie została znaleziona"
                )
            
            # Konwersja współrzędnych do formatu JSON
            coordinates_json = json.dumps(label.coordinates)
            
            # Aktualizacja etykiety
            db_label.image_id = label.image_id
            db_label.class_id = label.class_id
            db_label.type = label.type
            db_label.coordinates = coordinates_json
            db_label.confidence = label.confidence
            
            db.commit()
            db.refresh(db_label)
            
            # Konwersja współrzędnych z formatu JSON
            db_label.coordinates = json.loads(db_label.coordinates)
            
            return LabelResponse(
                success=True,
                message=f"Etykieta o ID {label_id} została zaktualizowana",
                data=db_label
            )
        except Exception as e:
            return LabelResponse(
                success=False,
                message=f"Błąd podczas aktualizacji etykiety: {str(e)}"
            )
    
    @staticmethod
    def delete_label(db: Session, label_id: int) -> LabelResponse:
        """
        Usuwa etykietę o podanym ID.
        """
        try:
            db_label = db.query(Label).filter(Label.id == label_id).first()
            
            if not db_label:
                return LabelResponse(
                    success=False,
                    message=f"Etykieta o ID {label_id} nie została znaleziona"
                )
            
            # Pobranie obrazu
            image_id = db_label.image_id
            
            # Usunięcie etykiety
            db.delete(db_label)
            db.commit()
            
            # Sprawdzenie, czy obraz ma jeszcze jakieś etykiety
            remaining_labels = db.query(Label).filter(Label.image_id == image_id).count()
            
            if remaining_labels == 0:
                # Jeśli nie ma więcej etykiet, oznacz obraz jako nieoznaczony
                image = db.query(Image).filter(Image.id == image_id).first()
                if image:
                    image.is_labeled = False
                    db.commit()
            
            return LabelResponse(
                success=True,
                message=f"Etykieta o ID {label_id} została usunięta"
            )
        except Exception as e:
            return LabelResponse(
                success=False,
                message=f"Błąd podczas usuwania etykiety: {str(e)}"
            )
    
    @staticmethod
    def create_multiple_labels(db: Session, labels: List[LabelCreate]) -> LabelsResponse:
        """
        Tworzy wiele etykiet jednocześnie.
        """
        try:
            created_labels = []
            image_ids = set()
            
            for label in labels:
                # Sprawdzenie, czy obraz istnieje
                image = db.query(Image).filter(Image.id == label.image_id).first()
                if not image:
                    continue
                
                # Sprawdzenie, czy klasa istnieje
                object_class = db.query(ObjectClass).filter(ObjectClass.id == label.class_id).first()
                if not object_class:
                    continue
                
                # Konwersja współrzędnych do formatu JSON
                coordinates_json = json.dumps(label.coordinates)
                
                # Utworzenie etykiety
                db_label = Label(
                    image_id=label.image_id,
                    class_id=label.class_id,
                    type=label.type,
                    coordinates=coordinates_json,
                    confidence=label.confidence
                )
                
                db.add(db_label)
                image_ids.add(label.image_id)
                created_labels.append(db_label)
            
            db.commit()
            
            # Odświeżenie etykiet
            for label in created_labels:
                db.refresh(label)
                # Konwersja współrzędnych z formatu JSON
                label.coordinates = json.loads(label.coordinates)
            
            # Oznaczenie obrazów jako oznaczone
            for image_id in image_ids:
                image = db.query(Image).filter(Image.id == image_id).first()
                if image:
                    image.is_labeled = True
            
            db.commit()
            
            return LabelsResponse(
                success=True,
                message=f"Utworzono {len(created_labels)} etykiet",
                data=created_labels,
                total=len(created_labels)
            )
        except Exception as e:
            return LabelsResponse(
                success=False,
                message=f"Błąd podczas tworzenia etykiet: {str(e)}"
            )
