import os
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class TrainingManager:
    """Manager do zarządzania procesem trenowania modeli"""
    
    def __init__(self):
        self.models_dir = os.environ.get("MODELS_DIR", "/app/models")
        os.makedirs(self.models_dir, exist_ok=True)
    
    def get_available_models(self) -> List[str]:
        """
        Pobiera listę dostępnych modeli
        
        Returns:
            Lista nazw dostępnych modeli
        """
        try:
            return [f for f in os.listdir(self.models_dir) if f.endswith('.pt')]
        except Exception as e:
            logger.error(f"Błąd podczas pobierania listy modeli: {str(e)}")
            return []
    
    def get_model_path(self, model_id: int) -> Optional[str]:
        """
        Pobiera ścieżkę do modelu
        
        Args:
            model_id: ID modelu
            
        Returns:
            Ścieżka do modelu lub None, jeśli model nie istnieje
        """
        model_files = [f for f in os.listdir(self.models_dir) if f.startswith(f"model_{model_id}_") and f.endswith('.pt')]
        if not model_files:
            return None
        
        # Zwróć najnowszy model
        model_files.sort(reverse=True)
        return os.path.join(self.models_dir, model_files[0])
    
    def get_model_metrics(self, model_id: int) -> Optional[dict]:
        """
        Pobiera metryki modelu
        
        Args:
            model_id: ID modelu
            
        Returns:
            Słownik z metrykami modelu lub None, jeśli model nie istnieje
        """
        model_path = self.get_model_path(model_id)
        if not model_path:
            return None
        
        metrics_path = f"{model_path}.json"
        if not os.path.exists(metrics_path):
            return None
        
        try:
            import json
            with open(metrics_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Błąd podczas odczytu metryk modelu: {str(e)}")
            return None
