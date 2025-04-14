# YOLO-COCO - Aplikacja do detekcji obiektów

Aplikacja webowa do trenowania modeli wykrywania obiektów na obrazach z wykorzystaniem YOLO i formatów COCO.

## Funkcjonalności

- Zarządzanie zbiorami danych i obrazami
- Etykietowanie obiektów (ręczne i automatyczne)
- Trenowanie modeli detekcji obiektów
- Detekcja obiektów na obrazach i w czasie rzeczywistym
- Integracja z kamerami IP
- Wizualizacja i porównywanie metryk modeli

## Technologie

### Frontend
- React
- Material UI
- Konva.js (do rysowania bounding boxów i wielokątów)
- Recharts (do wizualizacji metryk)
- Socket.IO (do komunikacji w czasie rzeczywistym)

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Celery
- MinIO
- PostgreSQL
- Redis
- YOLO (detekcja obiektów)

## Struktura projektu

```
yolo-coco/
├── frontend/             # Aplikacja React
│   ├── public/           # Pliki statyczne
│   ├── src/              # Kod źródłowy
│   │   ├── components/   # Komponenty React
│   │   ├── pages/        # Strony aplikacji
│   │   ├── services/     # Usługi API
│   │   └── utils/        # Narzędzia pomocnicze
│   └── Dockerfile        # Konfiguracja kontenera
├── backend/              # API FastAPI
│   ├── app/              # Kod źródłowy
│   │   ├── api/          # Endpointy API
│   │   ├── core/         # Konfiguracja
│   │   ├── db/           # Konfiguracja bazy danych
│   │   ├── models/       # Modele SQLAlchemy
│   │   ├── schemas/      # Schematy Pydantic
│   │   ├── services/     # Usługi biznesowe
│   │   ├── ai_engines/   # Silniki AI
│   │   └── worker/       # Zadania asynchroniczne
│   ├── Dockerfile        # Konfiguracja kontenera API
│   └── Dockerfile.worker # Konfiguracja kontenera workera
└── docker/               # Konfiguracja Docker
    ├── docker-compose.yml # Konfiguracja usług
    └── nginx.conf        # Konfiguracja Nginx
```

## Instalacja i uruchomienie

### Wymagania
- Docker
- Docker Compose
- Portainer (opcjonalnie)

### Uruchomienie lokalne
```bash
cd docker
docker-compose up -d
```

### Wdrożenie przez Portainer
1. Zaloguj się do Portainera
2. Przejdź do sekcji "Stacks"
3. Kliknij "Add stack"
4. Nadaj nazwę stosowi, np. "yolo-coco"
5. W sekcji "Build method" wybierz "Web editor"
6. Skopiuj zawartość pliku docker-compose.yml do edytora
7. Kliknij "Deploy the stack"

## Dostęp do aplikacji
- Frontend: http://localhost
- API: http://localhost/api/v1
- Dokumentacja API: http://localhost/api/v1/docs
- MinIO Console: http://localhost:9001
