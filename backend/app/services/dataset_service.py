from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
from typing import List, Optional, Dict, Any

from app.models.models import Dataset, Image
from app.schemas.schemas import DatasetCreate, DatasetResponse, DatasetsResponse, DatasetWithStats

class DatasetService:
    @staticmethod
    def create_dataset(db: Session, dataset: DatasetCreate) -> DatasetResponse:
        """
        Tworzy nowy zbiór danych.
        """
        try:
            db_dataset = Dataset(
                name=dataset.name,
                description=dataset.description
            )
            
            db.add(db_dataset)
            db.commit()
            db.refresh(db_dataset)
            
            return DatasetResponse(
                success=True,
                message="Zbiór danych został pomyślnie utworzony",
                data=db_dataset
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas tworzenia zbioru danych: {str(e)}"
            )
    
    @staticmethod
    def get_datasets(db: Session, skip: int = 0, limit: int = 100) -> DatasetsResponse:
        """
        Pobiera listę zbiorów danych.
        """
        try:
            total = db.query(Dataset).count()
            datasets = db.query(Dataset).offset(skip).limit(limit).all()
            
            return DatasetsResponse(
                success=True,
                message=f"Znaleziono {len(datasets)} zbiorów danych",
                data=datasets,
                total=total
            )
        except Exception as e:
            return DatasetsResponse(
                success=False,
                message=f"Błąd podczas pobierania zbiorów danych: {str(e)}"
            )
    
    @staticmethod
    def get_dataset(db: Session, dataset_id: int) -> DatasetResponse:
        """
        Pobiera zbiór danych o podanym ID.
        """
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not dataset:
                return DatasetResponse(
                    success=False,
                    message=f"Zbiór danych o ID {dataset_id} nie został znaleziony"
                )
            
            return DatasetResponse(
                success=True,
                message="Zbiór danych został znaleziony",
                data=dataset
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas pobierania zbioru danych: {str(e)}"
            )
    
    @staticmethod
    def update_dataset(db: Session, dataset_id: int, dataset: DatasetCreate) -> DatasetResponse:
        """
        Aktualizuje zbiór danych o podanym ID.
        """
        try:
            db_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not db_dataset:
                return DatasetResponse(
                    success=False,
                    message=f"Zbiór danych o ID {dataset_id} nie został znaleziony"
                )
            
            db_dataset.name = dataset.name
            db_dataset.description = dataset.description
            
            db.commit()
            db.refresh(db_dataset)
            
            return DatasetResponse(
                success=True,
                message=f"Zbiór danych o ID {dataset_id} został zaktualizowany",
                data=db_dataset
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas aktualizacji zbioru danych: {str(e)}"
            )
    
    @staticmethod
    def delete_dataset(db: Session, dataset_id: int) -> DatasetResponse:
        """
        Usuwa zbiór danych o podanym ID.
        """
        try:
            db_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not db_dataset:
                return DatasetResponse(
                    success=False,
                    message=f"Zbiór danych o ID {dataset_id} nie został znaleziony"
                )
            
            db.delete(db_dataset)
            db.commit()
            
            return DatasetResponse(
                success=True,
                message=f"Zbiór danych o ID {dataset_id} został usunięty"
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas usuwania zbioru danych: {str(e)}"
            )
    
    @staticmethod
    def get_dataset_with_stats(db: Session, dataset_id: int) -> Dict[str, Any]:
        """
        Pobiera zbiór danych wraz ze statystykami.
        """
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not dataset:
                raise HTTPException(status_code=404, detail=f"Zbiór danych o ID {dataset_id} nie został znaleziony")
            
            # Liczba obrazów w zbiorze danych
            images_count = db.query(Image).filter(Image.dataset_id == dataset_id).count()
            
            # Liczba oznaczonych obrazów w zbiorze danych
            labeled_images_count = db.query(Image).filter(
                Image.dataset_id == dataset_id,
                Image.is_labeled == True
            ).count()
            
            dataset_with_stats = DatasetWithStats(
                id=dataset.id,
                name=dataset.name,
                description=dataset.description,
                created_at=dataset.created_at,
                updated_at=dataset.updated_at,
                images_count=images_count,
                labeled_images_count=labeled_images_count
            )
            
            return {
                "success": True,
                "message": "Zbiór danych został znaleziony",
                "data": dataset_with_stats
            }
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania zbioru danych: {str(e)}")
    
    @staticmethod
    def add_images_to_dataset(db: Session, dataset_id: int, image_ids: List[int]) -> DatasetResponse:
        """
        Dodaje obrazy do zbioru danych.
        """
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not dataset:
                return DatasetResponse(
                    success=False,
                    message=f"Zbiór danych o ID {dataset_id} nie został znaleziony"
                )
            
            for image_id in image_ids:
                image = db.query(Image).filter(Image.id == image_id).first()
                
                if image:
                    image.dataset_id = dataset_id
            
            db.commit()
            
            return DatasetResponse(
                success=True,
                message=f"Obrazy zostały dodane do zbioru danych o ID {dataset_id}",
                data=dataset
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas dodawania obrazów do zbioru danych: {str(e)}"
            )
    
    @staticmethod
    def remove_images_from_dataset(db: Session, dataset_id: int, image_ids: List[int]) -> DatasetResponse:
        """
        Usuwa obrazy ze zbioru danych.
        """
        try:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
            
            if not dataset:
                return DatasetResponse(
                    success=False,
                    message=f"Zbiór danych o ID {dataset_id} nie został znaleziony"
                )
            
            for image_id in image_ids:
                image = db.query(Image).filter(
                    Image.id == image_id,
                    Image.dataset_id == dataset_id
                ).first()
                
                if image:
                    image.dataset_id = None
            
            db.commit()
            
            return DatasetResponse(
                success=True,
                message=f"Obrazy zostały usunięte ze zbioru danych o ID {dataset_id}",
                data=dataset
            )
        except Exception as e:
            return DatasetResponse(
                success=False,
                message=f"Błąd podczas usuwania obrazów ze zbioru danych: {str(e)}"
            )
