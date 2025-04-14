import json
import os
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_URL,
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=settings.MINIO_SECURE
        )
        
    def create_buckets(self):
        """Tworzy wymagane buckety, jeśli nie istnieją."""
        buckets = [
            settings.MODELS_BUCKET,
            settings.IMAGES_BUCKET,
            settings.DATASETS_BUCKET,
            settings.TEMP_BUCKET
        ]
        
        for bucket in buckets:
            try:
                if not self.client.bucket_exists(bucket):
                    self.client.make_bucket(bucket)
                    print(f"Bucket '{bucket}' został utworzony.")
                else:
                    print(f"Bucket '{bucket}' już istnieje.")
            except S3Error as e:
                print(f"Błąd podczas tworzenia bucketu '{bucket}': {e}")
    
    def upload_file(self, file_path, bucket_name, object_name=None):
        """Przesyła plik do MinIO."""
        if object_name is None:
            object_name = os.path.basename(file_path)
            
        try:
            self.client.fput_object(
                bucket_name, object_name, file_path
            )
            return True, object_name
        except S3Error as e:
            print(f"Błąd podczas przesyłania pliku: {e}")
            return False, str(e)
    
    def download_file(self, bucket_name, object_name, file_path):
        """Pobiera plik z MinIO."""
        try:
            self.client.fget_object(
                bucket_name, object_name, file_path
            )
            return True
        except S3Error as e:
            print(f"Błąd podczas pobierania pliku: {e}")
            return False
    
    def get_file_url(self, bucket_name, object_name, expires=3600):
        """Generuje tymczasowy URL do pliku."""
        try:
            url = self.client.presigned_get_object(
                bucket_name, object_name, expires=expires
            )
            return url
        except S3Error as e:
            print(f"Błąd podczas generowania URL: {e}")
            return None
    
    def list_files(self, bucket_name, prefix="", recursive=True):
        """Listuje pliki w buckecie."""
        try:
            objects = self.client.list_objects(
                bucket_name, prefix=prefix, recursive=recursive
            )
            return [obj.object_name for obj in objects]
        except S3Error as e:
            print(f"Błąd podczas listowania plików: {e}")
            return []
    
    def delete_file(self, bucket_name, object_name):
        """Usuwa plik z MinIO."""
        try:
            self.client.remove_object(bucket_name, object_name)
            return True
        except S3Error as e:
            print(f"Błąd podczas usuwania pliku: {e}")
            return False
    
    def upload_image(self, file_path, image_id):
        """Przesyła obraz do bucketu images."""
        object_name = f"image_{image_id}{os.path.splitext(file_path)[1]}"
        return self.upload_file(file_path, settings.IMAGES_BUCKET, object_name)
    
    def upload_model(self, file_path, model_id):
        """Przesyła model do bucketu models."""
        object_name = f"model_{model_id}{os.path.splitext(file_path)[1]}"
        return self.upload_file(file_path, settings.MODELS_BUCKET, object_name)
    
    def upload_dataset(self, file_path, dataset_id):
        """Przesyła dataset do bucketu datasets."""
        object_name = f"dataset_{dataset_id}{os.path.splitext(file_path)[1]}"
        return self.upload_file(file_path, settings.DATASETS_BUCKET, object_name)
    
    def get_image(self, object_name, file_path):
        """Pobiera obraz z bucketu images."""
        return self.download_file(settings.IMAGES_BUCKET, object_name, file_path)
    
    def get_model(self, object_name, file_path):
        """Pobiera model z bucketu models."""
        return self.download_file(settings.MODELS_BUCKET, object_name, file_path)
    
    def get_dataset(self, object_name, file_path):
        """Pobiera dataset z bucketu datasets."""
        return self.download_file(settings.DATASETS_BUCKET, object_name, file_path)
    
    def get_image_url(self, object_name, expires=3600):
        """Generuje tymczasowy URL do obrazu."""
        return self.get_file_url(settings.IMAGES_BUCKET, object_name, expires)
    
    def get_model_url(self, object_name, expires=3600):
        """Generuje tymczasowy URL do modelu."""
        return self.get_file_url(settings.MODELS_BUCKET, object_name, expires)
    
    def get_dataset_url(self, object_name, expires=3600):
        """Generuje tymczasowy URL do datasetu."""
        return self.get_file_url(settings.DATASETS_BUCKET, object_name, expires)

# Singleton instance
minio_service = MinioService()
