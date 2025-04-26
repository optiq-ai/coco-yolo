# Dokumentacja projektu YOLO-COCO

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Struktura projektu](#struktura-projektu)
3. [Rozwiązane problemy](#rozwiązane-problemy)
4. [Konfiguracja środowiska](#konfiguracja-środowiska)
5. [Uruchomienie aplikacji](#uruchomienie-aplikacji)
6. [Architektura aplikacji](#architektura-aplikacji)
7. [API Backend](#api-backend)
8. [Frontend](#frontend)
9. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## Wprowadzenie

Projekt YOLO-COCO to aplikacja do detekcji obiektów na obrazach z wykorzystaniem modeli YOLO (You Only Look Once) i formatu danych COCO (Common Objects in Context). Aplikacja składa się z frontendu React, backendu FastAPI oraz usług pomocniczych takich jak PostgreSQL, Redis i MinIO.

## Struktura projektu

```
yolo-coco-project/
├── backend/                 # Backend API - FastAPI
│   ├── app/                 # Kod źródłowy backendu
│   │   ├── core/            # Konfiguracja i podstawowe funkcje
│   │   ├── models/          # Modele bazy danych
│   │   ├── schemas/         # Schematy Pydantic
│   │   └── services/        # Logika biznesowa
│   ├── Dockerfile           # Konfiguracja kontenera backendu
│   ├── Dockerfile.worker    # Konfiguracja kontenera workera
│   └── requirements.txt     # Zależności Pythona
├── frontend/                # Frontend - React
│   ├── public/              # Pliki statyczne
│   ├── src/                 # Kod źródłowy frontendu
│   │   ├── components/      # Komponenty React
│   │   ├── pages/           # Strony aplikacji
│   │   ├── services/        # Usługi API
│   │   └── utils/           # Funkcje pomocnicze
│   ├── .env                 # Zmienne środowiskowe
│   ├── Dockerfile           # Konfiguracja kontenera frontendu
│   └── nginx.conf           # Konfiguracja Nginx
└── docker-compose.yml       # Konfiguracja Docker Compose
```

## Rozwiązane problemy

W projekcie rozwiązano następujące problemy:

### 1. Backend

#### Brakujące klasy schematów
Dodano brakujące klasy schematów w pliku `backend/app/schemas/schemas.py`:
- `DatasetsResponse` - do obsługi odpowiedzi z listą datasetów
- `DatasetWithStats` - do obsługi datasetów z dodatkowymi statystykami

#### Konflikt zależności pydantic
Rozwiązano konflikt między wersjami pydantic:
- Usunięto zależność `pydantic-settings`
- Zaktualizowano import w `config.py` do używania `BaseSettings` bezpośrednio z pydantic
- Dodano `python-dotenv` do obsługi zmiennych środowiskowych

#### Aktualizacja zależności
Zaktualizowano plik `requirements.txt` o wszystkie niezbędne zależności:
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- python-dotenv
- python-multipart
- celery
- minio
- opencv-python-headless
- i inne

### 2. Frontend

#### Problemy z ładowaniem JavaScript
Rozwiązano problemy z ładowaniem plików JavaScript:
- Zaktualizowano konfigurację Nginx z dedykowanymi sekcjami dla plików statycznych
- Dodano odpowiednie nagłówki cache dla plików statycznych
- Skonfigurowano zmienne środowiskowe w pliku `.env` z relatywnymi ścieżkami

#### Brakujący komponent TrainingPage
Zaimplementowano pełny komponent `TrainingPage.js` z wszystkimi potrzebnymi funkcjonalnościami:
- Zarządzanie stanem (useState, useEffect)
- Interfejs użytkownika z tabelą treningów
- Formularz do tworzenia/edycji treningu
- Wykresy do wizualizacji metryk

#### Problemy z CSS
Naprawiono ostrzeżenia CSS dotyczące właściwości font-smoothing:
- Zastąpiono `-moz-osx-font-smoothing: grayscale` bardziej standardową właściwością `font-smoothing: grayscale`

### 3. Docker

#### Konfiguracja Docker Compose
Poprawiono konfigurację Docker Compose:
- Zaktualizowano plik `docker-compose.yml` do używania procesu budowania z Dockerfile dla frontendu
- Dodano montowanie pliku `.env` do kontenera frontendu
- Zapewniono, że zmienne środowiskowe są dostępne podczas procesu budowania

## Konfiguracja środowiska

### Zmienne środowiskowe

#### Backend
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/yolo_coco
REDIS_URL=redis://redis:6379/0
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_URL=minio:9000
SECRET_KEY=supersecretkey
```

#### Frontend
```
PUBLIC_URL=/
REACT_APP_API_URL=/api
REACT_APP_WS_URL=/api/v1/ws
REACT_APP_MINIO_URL=/minio
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

## Uruchomienie aplikacji

### Wymagania
- Docker
- Docker Compose

### Kroki uruchomienia
1. Sklonuj repozytorium:
```bash
git clone https://github.com/optiq-ai/coco-yolo.git
cd coco-yolo
```

2. Uruchom aplikację za pomocą Docker Compose:
```bash
docker-compose up -d
```

3. Otwórz aplikację w przeglądarce:
```
http://localhost
```

4. Dostęp do API backendu:
```
http://localhost/api
```

5. Dostęp do konsoli MinIO:
```
http://localhost/minio-console
```

## Architektura aplikacji

### Backend (FastAPI)

Backend aplikacji jest zbudowany przy użyciu FastAPI i składa się z następujących komponentów:
- **API Routes** - endpointy API
- **Services** - logika biznesowa
- **Models** - modele bazy danych
- **Schemas** - schematy Pydantic do walidacji danych
- **Core** - konfiguracja i podstawowe funkcje

Backend komunikuje się z:
- **PostgreSQL** - baza danych
- **Redis** - kolejka zadań
- **MinIO** - przechowywanie plików
- **Worker** - asynchroniczne przetwarzanie zadań

### Frontend (React)

Frontend aplikacji jest zbudowany przy użyciu React i składa się z następujących komponentów:
- **Pages** - strony aplikacji
- **Components** - komponenty wielokrotnego użytku
- **Services** - komunikacja z API
- **Utils** - funkcje pomocnicze

Frontend jest serwowany przez Nginx, który również działa jako reverse proxy dla backendu i MinIO.

### Przepływ danych

1. Użytkownik wchodzi na stronę aplikacji
2. Frontend wysyła żądania do API backendu
3. Backend przetwarza żądania i komunikuje się z bazą danych, Redis i MinIO
4. Backend zwraca odpowiedzi do frontendu
5. Frontend renderuje dane dla użytkownika

## API Backend

### Endpointy API

#### Datasets
- `GET /api/v1/datasets` - pobieranie listy datasetów
- `POST /api/v1/datasets` - tworzenie nowego datasetu
- `GET /api/v1/datasets/{dataset_id}` - pobieranie datasetu
- `PUT /api/v1/datasets/{dataset_id}` - aktualizacja datasetu
- `DELETE /api/v1/datasets/{dataset_id}` - usuwanie datasetu
- `GET /api/v1/datasets/{dataset_id}/stats` - pobieranie statystyk datasetu

#### Images
- `GET /api/v1/images` - pobieranie listy obrazów
- `POST /api/v1/images` - dodawanie nowego obrazu
- `GET /api/v1/images/{image_id}` - pobieranie obrazu
- `DELETE /api/v1/images/{image_id}` - usuwanie obrazu

#### Models
- `GET /api/v1/models` - pobieranie listy modeli
- `POST /api/v1/models` - dodawanie nowego modelu
- `GET /api/v1/models/{model_id}` - pobieranie modelu
- `DELETE /api/v1/models/{model_id}` - usuwanie modelu

#### Trainings
- `GET /api/v1/trainings` - pobieranie listy treningów
- `POST /api/v1/trainings` - tworzenie nowego treningu
- `GET /api/v1/trainings/{training_id}` - pobieranie treningu
- `DELETE /api/v1/trainings/{training_id}` - usuwanie treningu
- `POST /api/v1/trainings/{training_id}/start` - rozpoczynanie treningu
- `POST /api/v1/trainings/{training_id}/stop` - zatrzymywanie treningu

## Frontend

### Strony aplikacji

- **Dashboard** - przegląd aplikacji
- **Datasets** - zarządzanie datasetami
- **Images** - zarządzanie obrazami
- **Models** - zarządzanie modelami
- **Training** - trenowanie modeli
- **Detection** - detekcja obiektów na obrazach

### Komponenty

- **Header** - nagłówek aplikacji
- **Sidebar** - menu boczne
- **DataTable** - tabela danych
- **ImageUploader** - komponent do przesyłania obrazów
- **ModelSelector** - komponent do wyboru modelu
- **TrainingForm** - formularz do tworzenia/edycji treningu
- **DetectionResult** - wynik detekcji obiektów

## Rozwiązywanie problemów

### Problem: Pusta strona w przeglądarce

**Rozwiązanie:**
1. Sprawdź, czy kontenery Docker działają poprawnie:
```bash
docker-compose ps
```

2. Sprawdź logi kontenera frontend:
```bash
docker-compose logs frontend
```

3. Upewnij się, że zmienne środowiskowe są poprawnie skonfigurowane w pliku `.env`

4. Wyczyść cache przeglądarki (Ctrl+F5 lub Ctrl+Shift+R)

### Problem: Błędy 404 dla plików JavaScript

**Rozwiązanie:**
1. Sprawdź konfigurację Nginx w pliku `nginx.conf`
2. Upewnij się, że pliki statyczne są poprawnie budowane:
```bash
docker-compose exec frontend ls -la /usr/share/nginx/html/static/js
```

3. Sprawdź, czy zmienne środowiskowe są poprawnie skonfigurowane:
```
PUBLIC_URL=/
INLINE_RUNTIME_CHUNK=false
```

### Problem: Błędy backendu

**Rozwiązanie:**
1. Sprawdź logi kontenera backend:
```bash
docker-compose logs backend
```

2. Upewnij się, że wszystkie zależności są zainstalowane:
```bash
docker-compose exec backend pip list
```

3. Sprawdź, czy baza danych jest dostępna:
```bash
docker-compose exec backend python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@db:5432/yolo_coco'); print('Connected!')"
```
