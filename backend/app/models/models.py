from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    path = Column(String)
    width = Column(Integer)
    height = Column(Integer)
    format = Column(String)
    size = Column(Integer)  # rozmiar w bajtach
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacje
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    dataset = relationship("Dataset", back_populates="images")
    annotations = relationship("Annotation", back_populates="image", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="image", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    format = Column(String)  # YOLO, COCO, VOC
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacje
    images = relationship("Image", back_populates="dataset")
    trainings = relationship("Training", back_populates="dataset")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    color = Column(String, nullable=True)  # kolor w formacie HEX
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacje
    annotations = relationship("Annotation", back_populates="class_obj")

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    x = Column(Float)  # współrzędna x lewego górnego rogu (lub środka dla YOLO)
    y = Column(Float)  # współrzędna y lewego górnego rogu (lub środka dla YOLO)
    width = Column(Float)
    height = Column(Float)
    format = Column(String)  # YOLO, COCO, VOC
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacje
    image_id = Column(Integer, ForeignKey("images.id"))
    image = relationship("Image", back_populates="annotations")
    class_id = Column(Integer, ForeignKey("classes.id"))
    class_obj = relationship("Class", back_populates="annotations")

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    model_type = Column(String)  # YOLOv5, YOLOv8, itp.
    framework = Column(String)  # PyTorch, TensorFlow, itp.
    version = Column(String)
    path = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    status = Column(String)  # created, training, trained, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacje
    trainings = relationship("Training", back_populates="model")
    detections = relationship("Detection", back_populates="model")

class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)
    results = Column(JSON, nullable=True)
    status = Column(String)  # created, processing, completed, failed
    error = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacje
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    dataset = relationship("Dataset", back_populates="trainings")
    model_id = Column(Integer, ForeignKey("models.id"))
    model = relationship("Model", back_populates="trainings")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    results = Column(JSON, nullable=True)
    status = Column(String)  # created, processing, completed, failed
    error = Column(Text, nullable=True)
    processing_time = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relacje
    image_id = Column(Integer, ForeignKey("images.id"))
    image = relationship("Image", back_populates="detections")
    model_id = Column(Integer, ForeignKey("models.id"))
    model = relationship("Model", back_populates="detections")
