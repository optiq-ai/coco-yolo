from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Schematy dla obrazów
class ImageBase(BaseModel):
    name: str
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None

class ImageCreate(ImageBase):
    pass

class ImageResponse(ImageBase):
    id: int
    path: str
    size: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    dataset_id: Optional[int] = None

    class Config:
        orm_mode = True

class ImageList(BaseModel):
    items: List[ImageResponse]
    total: int

# Schematy dla datasetów
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    format: str

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    success: bool = True
    message: str = "Operation successful"
    data: Optional[Any] = None

    class Config:
        orm_mode = True

class DatasetList(BaseModel):
    items: List[DatasetResponse]
    total: int

# Dodane brakujące klasy
class DatasetsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[DatasetResponse]] = None
    total: Optional[int] = None

class DatasetWithStats(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    images_count: int = 0
    labeled_images_count: int = 0

    class Config:
        orm_mode = True

# Schematy dla klas
class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class ClassResponse(ClassBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ClassList(BaseModel):
    items: List[ClassResponse]
    total: int

# Schematy dla adnotacji
class AnnotationBase(BaseModel):
    x: float
    y: float
    width: float
    height: float
    format: str
    class_id: int

class AnnotationCreate(AnnotationBase):
    image_id: int

class AnnotationResponse(AnnotationBase):
    id: int
    image_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class AnnotationList(BaseModel):
    items: List[AnnotationResponse]
    total: int

# Schematy dla modeli
class ModelBase(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: str
    framework: str
    version: str
    config: Optional[Dict[str, Any]] = None

class ModelCreate(ModelBase):
    pass

class ModelResponse(ModelBase):
    id: int
    path: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ModelList(BaseModel):
    items: List[ModelResponse]
    total: int

# Schematy dla trenowania
class TrainingBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class TrainingCreate(TrainingBase):
    dataset_id: int
    model_id: int

class TrainingResponse(TrainingBase):
    id: int
    dataset_id: int
    model_id: int
    results: Optional[Dict[str, Any]] = None
    status: str
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True

class TrainingList(BaseModel):
    items: List[TrainingResponse]
    total: int

# Schematy dla detekcji
class DetectionBase(BaseModel):
    image_id: int
    model_id: int

class DetectionCreate(DetectionBase):
    pass

class DetectionResponse(DetectionBase):
    id: int
    results: Optional[Dict[str, Any]] = None
    status: str
    error: Optional[str] = None
    processing_time: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class DetectionList(BaseModel):
    items: List[DetectionResponse]
    total: int
