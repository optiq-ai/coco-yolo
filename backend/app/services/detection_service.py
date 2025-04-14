import os
import tempfile
import numpy as np
import cv2
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import Detection, DetectionResult, Image, Model, ObjectClass
from app.schemas.schemas import DetectionCreate, DetectionResponse, DetectionsResponse
from app.services.minio_service import minio_service
from app.core.config import settings

class DetectionService:
    @staticmethod
    def create_detection(db: Session, detection: DetectionCreate) -> DetectionResponse:
        """
        Tworzy nową detekcję obiektów dla obrazu.
        """
        try:
            # Sprawdzenie, czy obraz istnieje
            image = db.query(Image).filter(Image.id == detection.image_id).first()
            if not image:
                return DetectionResponse(
                    success=False,
                    message=f"Obraz o ID {detection.image_id} nie został znaleziony"
                )
            
            # Sprawdzenie, czy model istnieje
            model = db.query(Model).filter(Model.id == detection.model_id).first()
            if not model:
                return DetectionResponse(
                    success=False,
                    message=f"Model o ID {detection.model_id} nie został znaleziony"
                )
            
            # Utworzenie rekordu detekcji
            db_detection = Detection(
                image_id=detection.image_id,
                model_id=detection.model_id,
                confidence_threshold=detection.confidence_threshold
            )
            
            db.add(db_detection)
            db.commit()
            db.refresh(db_detection)
            
            # Pobranie obrazu z MinIO
            with tempfile.NamedTemporaryFile(suffix=os.path.splitext(image.filepath)[1]) as temp_image:
                minio_service.get_image(image.filepath, temp_image.name)
                
                # Pobranie modelu z MinIO
                with tempfile.NamedTemporaryFile(suffix=os.path.splitext(model.filepath)[1]) as temp_model:
                    minio_service.get_model(model.filepath, temp_model.name)
                    
                    # Wczytanie obrazu
                    img = cv2.imread(temp_image.name)
                    
                    # Wykonanie detekcji
                    results = DetectionService._detect_with_yolo(
                        img, 
                        temp_model.name, 
                        detection.confidence_threshold
                    )
                    
                    # Zapisanie wyników detekcji
                    for result in results:
                        # Sprawdzenie, czy klasa istnieje
                        class_name = result["class_name"]
                        object_class = db.query(ObjectClass).filter(ObjectClass.name == class_name).first()
                        
                        if not object_class:
                            # Utworzenie nowej klasy
                            object_class = ObjectClass(
                                name=class_name,
                                color=DetectionService._get_random_color()
                            )
                            db.add(object_class)
                            db.commit()
                            db.refresh(object_class)
                        
                        # Utworzenie wyniku detekcji
                        db_result = DetectionResult(
                            detection_id=db_detection.id,
                            class_id=object_class.id,
                            coordinates=json.dumps(result["bbox"]),
                            confidence=result["confidence"]
                        )
                        
                        db.add(db_result)
                    
                    db.commit()
            
            # Pobranie wyników detekcji
            detection_results = db.query(DetectionResult).filter(
                DetectionResult.detection_id == db_detection.id
            ).all()
            
            # Konwersja współrzędnych z formatu JSON
            for result in detection_results:
                result.coordinates = json.loads(result.coordinates)
            
            return DetectionResponse(
                success=True,
                message="Detekcja została pomyślnie wykonana",
                data=db_detection,
                results=detection_results
            )
        except Exception as e:
            return DetectionResponse(
                success=False,
                message=f"Błąd podczas wykonywania detekcji: {str(e)}"
            )
    
    @staticmethod
    def _detect_with_yolo(img: np.ndarray, model_path: str, confidence_threshold: float) -> List[Dict[str, Any]]:
        """
        Wykonuje detekcję obiektów przy użyciu modelu YOLO.
        
        Args:
            img: Obraz w formacie numpy
            model_path: Ścieżka do pliku modelu
            confidence_threshold: Próg pewności dla detekcji
            
        Returns:
            Lista wykrytych obiektów
        """
        try:
            # Import YOLO tylko gdy jest potrzebny
            from ultralytics import YOLO
            
            # Wczytanie modelu
            model = YOLO(model_path)
            
            # Wykonanie detekcji
            results = model(img, conf=confidence_threshold)
            
            # Konwersja wyników do standardowego formatu
            detections = []
            
            for result in results:
                boxes = result.boxes
                for i, box in enumerate(boxes):
                    # Pobranie współrzędnych bounding boxa
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    # Pobranie klasy i pewności
                    class_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    class_name = result.names[class_id]
                    
                    # Konwersja do formatu x, y, width, height
                    x, y = x1, y1
                    width, height = x2 - x1, y2 - y1
                    
                    detections.append({
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": confidence,
                        "bbox": {
                            "x": int(x),
                            "y": int(y),
                            "width": int(width),
                            "height": int(height)
                        }
                    })
            
            return detections
        except Exception as e:
            print(f"Błąd podczas detekcji obiektów: {str(e)}")
            return []
    
    @staticmethod
    def _get_random_color() -> str:
        """
        Generuje losowy kolor w formacie HEX.
        """
        r = np.random.randint(0, 255)
        g = np.random.randint(0, 255)
        b = np.random.randint(0, 255)
        return f"#{r:02x}{g:02x}{b:02x}"
    
    @staticmethod
    def get_detections(db: Session, image_id: Optional[int] = None, model_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> DetectionsResponse:
        """
        Pobiera listę detekcji.
        """
        try:
            query = db.query(Detection)
            
            if image_id is not None:
                query = query.filter(Detection.image_id == image_id)
            
            if model_id is not None:
                query = query.filter(Detection.model_id == model_id)
            
            total = query.count()
            detections = query.offset(skip).limit(limit).all()
            
            return DetectionsResponse(
                success=True,
                message=f"Znaleziono {len(detections)} detekcji",
                data=detections,
                total=total
            )
        except Exception as e:
            return DetectionsResponse(
                success=False,
                message=f"Błąd podczas pobierania detekcji: {str(e)}"
            )
    
    @staticmethod
    def get_detection(db: Session, detection_id: int) -> DetectionResponse:
        """
        Pobiera detekcję o podanym ID.
        """
        try:
            detection = db.query(Detection).filter(Detection.id == detection_id).first()
            
            if not detection:
                return DetectionResponse(
                    success=False,
                    message=f"Detekcja o ID {detection_id} nie została znaleziona"
                )
            
            # Pobranie wyników detekcji
            detection_results = db.query(DetectionResult).filter(
                DetectionResult.detection_id == detection_id
            ).all()
            
            # Konwersja współrzędnych z formatu JSON
            for result in detection_results:
                result.coordinates = json.loads(result.coordinates)
            
            return DetectionResponse(
                success=True,
                message="Detekcja została znaleziona",
                data=detection,
                results=detection_results
            )
        except Exception as e:
            return DetectionResponse(
                success=False,
                message=f"Błąd podczas pobierania detekcji: {str(e)}"
            )
    
    @staticmethod
    def delete_detection(db: Session, detection_id: int) -> DetectionResponse:
        """
        Usuwa detekcję o podanym ID.
        """
        try:
            detection = db.query(Detection).filter(Detection.id == detection_id).first()
            
            if not detection:
                return DetectionResponse(
                    success=False,
                    message=f"Detekcja o ID {detection_id} nie została znaleziona"
                )
            
            # Usunięcie wyników detekcji
            db.query(DetectionResult).filter(
                DetectionResult.detection_id == detection_id
            ).delete()
            
            # Usunięcie detekcji
            db.delete(detection)
            db.commit()
            
            return DetectionResponse(
                success=True,
                message=f"Detekcja o ID {detection_id} została usunięta"
            )
        except Exception as e:
            return DetectionResponse(
                success=False,
                message=f"Błąd podczas usuwania detekcji: {str(e)}"
            )
