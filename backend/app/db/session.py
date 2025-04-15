from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Tworzenie silnika SQLAlchemy
engine = create_engine(str(settings.DATABASE_URL))

# Tworzenie sesji
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bazowa klasa dla modeli
Base = declarative_base()

# Funkcja pomocnicza do uzyskiwania sesji bazy danych
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
