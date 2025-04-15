from fastapi import APIRouter
from app.api.api_v1.endpoints import images, datasets, labels, models, trainings, detection, classes, websockets

api_router = APIRouter()

api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(labels.router, prefix="/labels", tags=["labels"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(trainings.router, prefix="/trainings", tags=["trainings"])
api_router.include_router(detection.router, prefix="/detection", tags=["detection"])
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
