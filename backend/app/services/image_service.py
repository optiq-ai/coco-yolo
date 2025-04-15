from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.schemas import ImageCreate, ImageResponse, ImageList
from app.models.models import Image
import os
import uuid
import shutil
import logging
from minio import Minio
from app.core.config import settings
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)
        
        # Inicjalizacja klienta MinIO
        self.minio_client = Minio(
            settings.MINIO_URL,
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=False
        )
        
        # Upewnij się, że bucket istnieje
        if not self.minio_client.bucket_exists("images"):
            self.minio_client.make_bucket("images")
            self.minio_client.set_bucket_policy("images", '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::images/*"]}]}')

    async def upload_image(self, file: UploadFile, dataset_id: Optional[int] = None) -> Image:
        """Przesyła nowy obraz"""
        try:
            # Generuj unikalną nazwę pliku
            file_extension = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(self.upload_dir, unique_filename)
            
            # Zapisz plik lokalnie
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Odczytaj wymiary obrazu
            img = cv2.imread(file_path)
            height, width = img.shape[:2]
            
            # Prześlij plik do MinIO
            self.minio_client.fput_object(
                "images", 
                unique_filename, 
                file_path,
                content_type=f"image/{file_extension}"
            )
            
            # Utwórz rekord w bazie danych
            new_image = Image(
                name=file.filename,
                path=unique_filename,
                width=width,
                height=height,
                format=file_extension,
                size=os.path.getsize(file_path),
                dataset_id=dataset_id
            )
            
            self.db.add(new_image)
            self.db.commit()
            self.db.refresh(new_image)
            
            # Usuń lokalny plik po przesłaniu do MinIO
            os.remove(file_path)
            
            return new_image
        except Exception as e:
            logger.error(f"Błąd podczas przesyłania obrazu: {str(e)}")
            self.db.rollback()
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Błąd podczas przesyłania obrazu: {str(e)}")

    def get_image(self, image_id: int) -> Image:
        """Pobiera obraz po ID"""
        image = self.db.query(Image).filter(Image.id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Obraz nie znaleziony")
        return image

    def get_images(self, skip: int = 0, limit: int = 100, dataset_id: Optional[int] = None) -> List[Image]:
        """Pobiera listę obrazów"""
        query = self.db.query(Image)
        
        if dataset_id is not None:
            query = query.filter(Image.dataset_id == dataset_id)
        
        return query.offset(skip).limit(limit).all()

    def delete_image(self, image_id: int) -> bool:
        """Usuwa obraz"""
        image = self.get_image(image_id)
        
        try:
            # Usuń plik z MinIO
            self.minio_client.remove_object("images", image.path)
            
            # Usuń rekord z bazy danych
            self.db.delete(image)
            self.db.commit()
            
            return True
        except Exception as e:
            logger.error(f"Błąd podczas usuwania obrazu: {str(e)}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Błąd podczas usuwania obrazu: {str(e)}")
