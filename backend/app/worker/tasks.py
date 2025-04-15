import logging
from celery import shared_task
from app.services.detection_service import DetectionService
from app.services.training_service import TrainingService
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

@shared_task(name="process_detection")
def process_detection(image_id: int, model_id: int):
    """
    Zadanie asynchroniczne do przetwarzania detekcji obiektów na obrazie
    """
    logger.info(f"Rozpoczęcie detekcji dla obrazu {image_id} z modelem {model_id}")
    try:
        db = SessionLocal()
        detection_service = DetectionService(db)
        result = detection_service.process_detection(image_id, model_id)
        db.close()
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Błąd podczas detekcji: {str(e)}")
        if 'db' in locals():
            db.close()
        return {"status": "error", "message": str(e)}

@shared_task(name="train_model")
def train_model(training_id: int):
    """
    Zadanie asynchroniczne do trenowania modelu
    """
    logger.info(f"Rozpoczęcie trenowania dla zadania {training_id}")
    try:
        db = SessionLocal()
        training_service = TrainingService(db)
        result = training_service.process_training(training_id)
        db.close()
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Błąd podczas trenowania: {str(e)}")
        if 'db' in locals():
            db.close()
        return {"status": "error", "message": str(e)}

@shared_task(name="export_model")
def export_model(model_id: int, format: str):
    """
    Zadanie asynchroniczne do eksportowania modelu do określonego formatu
    """
    logger.info(f"Rozpoczęcie eksportu modelu {model_id} do formatu {format}")
    try:
        db = SessionLocal()
        # Tutaj implementacja eksportu modelu
        db.close()
        return {"status": "success", "message": f"Model {model_id} wyeksportowany do formatu {format}"}
    except Exception as e:
        logger.error(f"Błąd podczas eksportu modelu: {str(e)}")
        if 'db' in locals():
            db.close()
        return {"status": "error", "message": str(e)}
