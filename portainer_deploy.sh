#!/bin/bash

# Skrypt do wdrożenia projektu YOLO-COCO przez Portainer

# Kolory do wyświetlania komunikatów
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Przygotowuję instrukcje wdrożenia projektu YOLO-COCO przez Portainer...${NC}"

# Sprawdzenie, czy jesteśmy w katalogu projektu
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Nie jesteś w katalogu projektu. Przejdź do katalogu projektu przed kontynuowaniem.${NC}"
    exit 1
fi

# Tworzenie katalogu na pliki wdrożeniowe
mkdir -p portainer_deploy

# Kopiowanie plików potrzebnych do wdrożenia
cp docker-compose.yml portainer_deploy/
cp -r frontend portainer_deploy/
cp -r backend portainer_deploy/

# Tworzenie pliku README z instrukcjami
cat > portainer_deploy/README.md << 'EOL'
# Instrukcje wdrożenia projektu YOLO-COCO przez Portainer

## Wymagania
- Serwer z zainstalowanym Dockerem
- Portainer CE lub EE
- Dostęp do internetu z serwera

## Kroki wdrożenia

### 1. Logowanie do Portainer
- Otwórz przeglądarkę i przejdź do adresu Portainer (np. http://twoj-serwer:9000)
- Zaloguj się do Portainer używając swoich danych logowania

### 2. Tworzenie stosu (Stack)
- W menu bocznym wybierz "Stacks"
- Kliknij przycisk "Add stack"
- Nadaj nazwę stosowi, np. "yolo-coco"

### 3. Wdrożenie za pomocą pliku docker-compose.yml
- W sekcji "Build method" wybierz "Upload"
- Prześlij plik docker-compose.yml z tego katalogu
- Alternatywnie, możesz skopiować zawartość pliku docker-compose.yml i wkleić ją w polu "Web editor"
- Kliknij przycisk "Deploy the stack"

### 4. Weryfikacja wdrożenia
- Po zakończeniu wdrożenia, sprawdź czy wszystkie kontenery są uruchomione
- Aplikacja będzie dostępna pod adresem http://twoj-serwer
- API będzie dostępne pod adresem http://twoj-serwer:8000
- MinIO będzie dostępne pod adresem http://twoj-serwer:9000
- Konsola MinIO będzie dostępna pod adresem http://twoj-serwer:9001

### 5. Konfiguracja zmiennych środowiskowych (opcjonalnie)
W przypadku potrzeby zmiany domyślnych ustawień, możesz edytować zmienne środowiskowe w sekcji "Environment variables" w Portainer:

- DATABASE_URL: postgresql://postgres:postgres@db:5432/yolo_coco
- REDIS_URL: redis://redis:6379/0
- MINIO_ROOT_USER: minioadmin
- MINIO_ROOT_PASSWORD: minioadmin
- MINIO_URL: minio:9000
- SECRET_KEY: supersecretkey

### 6. Aktualizacja aplikacji
Aby zaktualizować aplikację:
- Przejdź do sekcji "Stacks" w Portainer
- Znajdź stos "yolo-coco"
- Kliknij na nazwę stosu
- Kliknij przycisk "Editor"
- Zaktualizuj zawartość pliku docker-compose.yml
- Kliknij przycisk "Update the stack"

## Rozwiązywanie problemów

### Problem z dostępem do aplikacji
- Sprawdź, czy wszystkie kontenery są uruchomione w Portainer
- Sprawdź logi kontenerów, aby zidentyfikować problem
- Upewnij się, że porty 80, 8000, 9000 i 9001 są dostępne na serwerze

### Problem z bazą danych
- Sprawdź logi kontenera db
- Upewnij się, że wolumen postgres_data jest poprawnie zamontowany

### Problem z przechowywaniem plików
- Sprawdź logi kontenera minio
- Upewnij się, że wolumen minio_data jest poprawnie zamontowany
- Sprawdź, czy buckets zostały utworzone poprawnie

## Kontakt
W przypadku problemów z wdrożeniem, skontaktuj się z administratorem systemu.
EOL

# Tworzenie archiwum z plikami wdrożeniowymi
echo -e "${YELLOW}Tworzenie archiwum z plikami wdrożeniowymi...${NC}"
zip -r portainer_deploy.zip portainer_deploy

echo -e "${GREEN}Instrukcje wdrożenia przez Portainer zostały przygotowane!${NC}"
echo -e "${YELLOW}Archiwum z plikami wdrożeniowymi: portainer_deploy.zip${NC}"
echo -e "${YELLOW}Instrukcje wdrożenia: portainer_deploy/README.md${NC}"
