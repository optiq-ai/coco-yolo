from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.api_v1.api import api_router
from app.core.config import settings
import logging

# Konfiguracja loggera
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="YOLO-COCO API",
    description="API do detekcji obiektów na obrazach z wykorzystaniem modeli YOLO",
    version="0.1.0",
)

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji należy ograniczyć do konkretnych domen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dodanie routerów API
app.include_router(api_router, prefix="/api/v1")

# Endpoint zdrowia
@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}

# Obsługa błędów
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Nieobsłużony wyjątek: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Wystąpił wewnętrzny błąd serwera"},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
