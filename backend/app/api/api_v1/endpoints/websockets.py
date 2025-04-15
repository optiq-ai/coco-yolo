from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Przechowywanie aktywnych połączeń WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/status")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint WebSocket do monitorowania statusu zadań"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Tutaj można dodać logikę obsługi różnych typów wiadomości
                await manager.send_personal_message(json.dumps({"status": "received", "message": message}), websocket)
            except json.JSONDecodeError:
                await manager.send_personal_message(json.dumps({"status": "error", "message": "Invalid JSON"}), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Funkcja do wysyłania aktualizacji statusu do klientów
async def send_status_update(task_id: str, status: str, data: dict = None):
    """
    Wysyła aktualizację statusu zadania do wszystkich podłączonych klientów
    
    Args:
        task_id: ID zadania
        status: Status zadania (started, processing, completed, failed)
        data: Dodatkowe dane do wysłania
    """
    message = {
        "task_id": task_id,
        "status": status
    }
    
    if data:
        message["data"] = data
        
    await manager.broadcast(json.dumps(message))
