from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime

from app.db.session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relacje
    images = relationship("Image", back_populates="dataset")

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    width = Column(Integer)
    height = Column(Integer)
    format = Column(String)
    is_labeled = Column(Boolean, default=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacje
    dataset = relationship("Dataset", back_populates="images")
    labels = relationship("Label", back_populates="image", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="image", cascade="all, delete-orphan")

class ObjectClass(Base):
    __tablename__ = "object_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    color = Column(String)  # Format HEX, np. "#FF5733"
    description = Column(String, nullable=True)

    # Relacje
    labels = relationship("Label", back_populates="object_class")

class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    class_id = Column(Integer, ForeignKey("object_classes.id"))
    type = Column(String)  # "bbox" lub "polygon"
    coordinates = Column(Text)  # JSON jako string
    confidence = Column(Float, nullable=True)  # Dla automatycznych etykiet

    # Relacje
    image = relationship("Image", back_populates="labels")
    object_class = relationship("ObjectClass", back_populates="labels")

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # np. "yolo", "faster_rcnn"
    filepath = Column(String)
    version = Column(String)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacje
    trainings = relationship("Training", back_populates="model")
    detections = relationship("Detection", back_populates="model")

class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    status = Column(String)  # "pending", "running", "completed", "failed", "cancelled"
    epochs = Column(Integer)
    batch_size = Column(Integer)
    learning_rate = Column(Float)
    progress = Column(Float, default=0.0)  # 0.0 - 1.0
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relacje
    model = relationship("Model", back_populates="trainings")
    dataset = relationship("Dataset")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    confidence_threshold = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacje
    image = relationship("Image", back_populates="detections")
    model = relationship("Model", back_populates="detections")
    results = relationship("DetectionResult", back_populates="detection", cascade="all, delete-orphan")

class DetectionResult(Base):
    __tablename__ = "detection_results"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("detections.id"))
    class_id = Column(Integer, ForeignKey("object_classes.id"))
    coordinates = Column(Text)  # JSON jako string
    confidence = Column(Float)

    # Relacje
    detection = relationship("Detection", back_populates="results")
    object_class = relationship("ObjectClass")

class IPCamera(Base):
    __tablename__ = "ip_cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)  # URL strumienia RTSP/HTTP
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    status = Column(String, default="inactive")  # "active", "inactive", "error"
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)  # Model do detekcji
    confidence_threshold = Column(Float, default=0.5)
    fps = Column(Integer, default=10)  # Liczba klatek na sekundę do przetwarzania
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relacje
    model = relationship("Model")
    recordings = relationship("Recording", back_populates="camera", cascade="all, delete-orphan")

class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("ip_cameras.id"))
    filepath = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # w sekundach
    size = Column(Integer, nullable=True)  # w bajtach
    status = Column(String, default="recording")  # "recording", "completed", "error"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacje
    camera = relationship("IPCamera", back_populates="recordings")
