from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Base schemas
class ObjectClassBase(BaseModel):
    name: str
    color: str
    description: Optional[str] = None

class ObjectClassCreate(ObjectClassBase):
    pass

class ObjectClass(ObjectClassBase):
    id: int
    
    class Config:
        orm_mode = True

# Image schemas
class ImageBase(BaseModel):
    filename: str
    filepath: str
    width: int
    height: int
    format: str
    dataset_id: Optional[int] = None

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    is_labeled: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Dataset schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class DatasetWithStats(Dataset):
    images_count: int
    labeled_images_count: int

# Label schemas
class Coordinates(BaseModel):
    x: float = Field(..., description="X coordinate (for bbox) or array of x coordinates (for polygon)")
    y: float = Field(..., description="Y coordinate (for bbox) or array of y coordinates (for polygon)")
    width: Optional[float] = Field(None, description="Width of bounding box (only for bbox)")
    height: Optional[float] = Field(None, description="Height of bounding box (only for bbox)")
    points: Optional[List[float]] = Field(None, description="Array of points for polygon [x1,y1,x2,y2,...]")

class LabelBase(BaseModel):
    image_id: int
    class_id: int
    type: str  # "bbox" or "polygon"
    coordinates: Dict[str, Any]
    confidence: Optional[float] = None

class LabelCreate(LabelBase):
    pass

class Label(LabelBase):
    id: int
    
    class Config:
        orm_mode = True

# Model schemas
class ModelBase(BaseModel):
    name: str
    type: str
    filepath: str
    version: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None

class ModelCreate(ModelBase):
    pass

class Model(ModelBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Training schemas
class TrainingBase(BaseModel):
    model_id: int
    dataset_id: int
    epochs: int
    batch_size: int
    learning_rate: float

class TrainingCreate(TrainingBase):
    pass

class Training(TrainingBase):
    id: int
    status: str
    progress: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Detection schemas
class DetectionBase(BaseModel):
    image_id: int
    model_id: int
    confidence_threshold: float

class DetectionCreate(DetectionBase):
    pass

class DetectionResultBase(BaseModel):
    class_id: int
    coordinates: Dict[str, Any]
    confidence: float

class DetectionResultCreate(DetectionResultBase):
    pass

class DetectionResult(DetectionResultBase):
    id: int
    detection_id: int
    
    class Config:
        orm_mode = True

class Detection(DetectionBase):
    id: int
    created_at: datetime
    results: List[DetectionResult] = []
    
    class Config:
        orm_mode = True

# IP Camera schemas
class IPCameraBase(BaseModel):
    name: str
    url: str
    username: Optional[str] = None
    password: Optional[str] = None
    model_id: Optional[int] = None
    confidence_threshold: float = 0.5
    fps: int = 10

class IPCameraCreate(IPCameraBase):
    pass

class IPCamera(IPCameraBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Recording schemas
class RecordingBase(BaseModel):
    camera_id: int
    filepath: str
    start_time: datetime

class RecordingCreate(RecordingBase):
    pass

class Recording(RecordingBase):
    id: int
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    size: Optional[int] = None
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# Response schemas
class ResponseBase(BaseModel):
    success: bool
    message: str

class DataResponse(ResponseBase):
    data: Optional[Dict[str, Any]] = None

class ListResponse(ResponseBase):
    data: List[Any] = []
    total: int = 0

class ImageResponse(ResponseBase):
    data: Optional[Image] = None

class ImagesResponse(ResponseBase):
    data: List[Image] = []
    total: int = 0

class DatasetResponse(ResponseBase):
    data: Optional[Dataset] = None

class DatasetsResponse(ResponseBase):
    data: List[Dataset] = []
    total: int = 0

class LabelResponse(ResponseBase):
    data: Optional[Label] = None

class LabelsResponse(ResponseBase):
    data: List[Label] = []
    total: int = 0

class ModelResponse(ResponseBase):
    data: Optional[Model] = None

class ModelsResponse(ResponseBase):
    data: List[Model] = []
    total: int = 0

class TrainingResponse(ResponseBase):
    data: Optional[Training] = None

class TrainingsResponse(ResponseBase):
    data: List[Training] = []
    total: int = 0

class DetectionResponse(ResponseBase):
    data: Optional[Detection] = None
    results: List[DetectionResult] = []

class DetectionsResponse(ResponseBase):
    data: List[Detection] = []
    total: int = 0

class IPCameraResponse(ResponseBase):
    data: Optional[IPCamera] = None

class IPCamerasResponse(ResponseBase):
    data: List[IPCamera] = []
    total: int = 0

class RecordingResponse(ResponseBase):
    data: Optional[Recording] = None

class RecordingsResponse(ResponseBase):
    data: List[Recording] = []
    total: int = 0
