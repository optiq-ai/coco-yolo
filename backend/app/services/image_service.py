from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
from PIL import Image as PILImage
import io
import uuid
from typing import List, Optional, Dict, Any

from app.models.models import Image
from app.schemas.schemas import ImageCreate, ImageResponse, ImagesResponse
from app.services.minio_service import minio_service

class ImageService:
    @staticmethod
    async def create_image(db: Session, file: UploadFile, dataset_id: Optional[int] = None) -> ImageResponse:
        """
        Tworzy nowy obraz w systemie.
        """
        try:
            # Tworzenie tymczasowego pliku
            temp_file = f"/tmp/{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
            
            with open(temp_file, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Odczytanie wymiarów obrazu
            with PILImage.open(temp_file) as img:
                width, height = img.size
                format = img.format
            
            # Utworzenie rekordu w bazie danych
            db_image = Image(
                filename=file.filename,
                filepath="",  # Tymczasowo puste, zostanie zaktualizowane po przesłaniu do MinIO
                width=width,
                height=height,
                format=format.lower() if format else "",
                dataset_id=dataset_id
            )
            
            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            
            # Przesłanie pliku do MinIO
            success, object_name = minio_service.upload_image(temp_file, db_image.id)
            
            if not success:
                # Usunięcie rekordu z bazy danych w przypadku błędu
                db.delete(db_image)
                db.commit()
                
                # Usunięcie tymczasowego pliku
                os.remove(temp_file)
                
                return ImageResponse(
                    success=False,
                    message=f"Błąd podczas przesyłania obrazu do MinIO: {object_name}"
                )
            
            # Aktualizacja ścieżki do pliku
            db_image.filepath = object_name
            db.commit()
            db.refresh(db_image)
            
            # Usunięcie tymczasowego pliku
            os.remove(temp_file)
            
            return ImageResponse(
                success=True,
                message="Obraz został pomyślnie dodany",
                data=db_image
            )
        except Exception as e:
            return ImageResponse(
                success=False,
                message=f"Błąd podczas dodawania obrazu: {str(e)}"
            )
    
    @staticmethod
    def get_images(db: Session, skip: int = 0, limit: int = 100, dataset_id: Optional[int] = None) -> ImagesResponse:
        """
        Pobiera listę obrazów.
        """
        try:
            query = db.query(Image)
            
            if dataset_id is not None:
                query = query.filter(Image.dataset_id == dataset_id)
            
            total = query.count()
            images = query.offset(skip).limit(limit).all()
            
            return ImagesResponse(
                success=True,
                message=f"Znaleziono {len(images)} obrazów",
                data=images,
                total=total
            )
        except Exception as e:
            return ImagesResponse(
                success=False,
                message=f"Błąd podczas pobierania obrazów: {str(e)}"
            )
    
    @staticmethod
    def get_image(db: Session, image_id: int) -> ImageResponse:
        """
        Pobiera obraz o podanym ID.
        """
        try:
            image = db.query(Image).filter(Image.id == image_id).first()
            
            if not image:
                return ImageResponse(
                    success=False,
                    message=f"Obraz o ID {image_id} nie został znaleziony"
                )
            
            return ImageResponse(
                success=True,
                message="Obraz został znaleziony",
                data=image
            )
        except Exception as e:
            return ImageResponse(
                success=False,
                message=f"Błąd podczas pobierania obrazu: {str(e)}"
            )
    
    @staticmethod
    def delete_image(db: Session, image_id: int) -> ImageResponse:
        """
        Usuwa obraz o podanym ID.
        """
        try:
            image = db.query(Image).filter(Image.id == image_id).first()
            
            if not image:
                return ImageResponse(
                    success=False,
                    message=f"Obraz o ID {image_id} nie został znaleziony"
                )
            
            # Usunięcie pliku z MinIO
            if image.filepath:
                minio_service.delete_file(minio_service.IMAGES_BUCKET, image.filepath)
            
            # Usunięcie rekordu z bazy danych
            db.delete(image)
            db.commit()
            
            return ImageResponse(
                success=True,
                message=f"Obraz o ID {image_id} został usunięty"
            )
        except Exception as e:
            return ImageResponse(
                success=False,
                message=f"Błąd podczas usuwania obrazu: {str(e)}"
            )
    
    @staticmethod
    def get_image_url(db: Session, image_id: int) -> Dict[str, Any]:
        """
        Generuje URL do obrazu.
        """
        try:
            image = db.query(Image).filter(Image.id == image_id).first()
            
            if not image:
                raise HTTPException(status_code=404, detail=f"Obraz o ID {image_id} nie został znaleziony")
            
            url = minio_service.get_image_url(image.filepath)
            
            if not url:
                raise HTTPException(status_code=500, detail="Błąd podczas generowania URL")
            
            return {
                "success": True,
                "url": url,
                "filename": image.filename
            }
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Błąd podczas generowania URL: {str(e)}")
    
    @staticmethod
    def update_image_dataset(db: Session, image_id: int, dataset_id: Optional[int]) -> ImageResponse:
        """
        Aktualizuje przypisanie obrazu do zbioru danych.
        """
        try:
            image = db.query(Image).filter(Image.id == image_id).first()
            
            if not image:
                return ImageResponse(
                    success=False,
                    message=f"Obraz o ID {image_id} nie został znaleziony"
                )
            
            image.dataset_id = dataset_id
            db.commit()
            db.refresh(image)
            
            return ImageResponse(
                success=True,
                message=f"Obraz o ID {image_id} został zaktualizowany",
                data=image
            )
        except Exception as e:
            return ImageResponse(
                success=False,
                message=f"Błąd podczas aktualizacji obrazu: {str(e)}"
            )
