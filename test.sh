#!/bin/bash

# Skrypt do testowania lokalnego wdrożenia projektu YOLO-COCO

# Kolory do wyświetlania komunikatów
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Rozpoczynam testowanie lokalnego wdrożenia projektu YOLO-COCO...${NC}"

# Sprawdzenie, czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker nie jest zainstalowany. Proszę zainstalować Docker przed kontynuowaniem.${NC}"
    exit 1
fi

# Sprawdzenie, czy Docker Compose jest zainstalowany
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose nie jest zainstalowany. Proszę zainstalować Docker Compose przed kontynuowaniem.${NC}"
    exit 1
fi

# Zatrzymanie istniejących kontenerów (jeśli istnieją)
echo -e "${YELLOW}Zatrzymywanie istniejących kontenerów...${NC}"
docker-compose down

# Budowanie i uruchamianie kontenerów
echo -e "${YELLOW}Budowanie i uruchamianie kontenerów...${NC}"
docker-compose up -d --build

# Sprawdzenie, czy wszystkie kontenery są uruchomione
echo -e "${YELLOW}Sprawdzanie statusu kontenerów...${NC}"
sleep 10 # Dajemy czas na uruchomienie wszystkich kontenerów

if [ $(docker-compose ps | grep -c "Up") -eq 7 ]; then
    echo -e "${GREEN}Wszystkie kontenery zostały pomyślnie uruchomione.${NC}"
else
    echo -e "${RED}Nie wszystkie kontenery zostały uruchomione. Sprawdź logi za pomocą 'docker-compose logs'.${NC}"
    docker-compose ps
    exit 1
fi

# Sprawdzenie, czy API jest dostępne
echo -e "${YELLOW}Sprawdzanie dostępności API...${NC}"
if curl -s http://localhost:8000/health | grep -q "ok"; then
    echo -e "${GREEN}API jest dostępne.${NC}"
else
    echo -e "${RED}API nie jest dostępne. Sprawdź logi za pomocą 'docker-compose logs backend'.${NC}"
    docker-compose logs backend
    exit 1
fi

# Sprawdzenie, czy frontend jest dostępny
echo -e "${YELLOW}Sprawdzanie dostępności frontendu...${NC}"
if curl -s -I http://localhost | grep -q "200 OK"; then
    echo -e "${GREEN}Frontend jest dostępny.${NC}"
else
    echo -e "${RED}Frontend nie jest dostępny. Sprawdź logi za pomocą 'docker-compose logs frontend'.${NC}"
    docker-compose logs frontend
    exit 1
fi

# Sprawdzenie, czy MinIO jest dostępne
echo -e "${YELLOW}Sprawdzanie dostępności MinIO...${NC}"
if curl -s -I http://localhost:9000 | grep -q "200 OK"; then
    echo -e "${GREEN}MinIO jest dostępne.${NC}"
else
    echo -e "${RED}MinIO nie jest dostępne. Sprawdź logi za pomocą 'docker-compose logs minio'.${NC}"
    docker-compose logs minio
    exit 1
fi

echo -e "${GREEN}Testowanie lokalne zakończone pomyślnie!${NC}"
echo -e "${YELLOW}Aplikacja jest dostępna pod adresem: http://localhost${NC}"
echo -e "${YELLOW}API jest dostępne pod adresem: http://localhost:8000${NC}"
echo -e "${YELLOW}MinIO jest dostępne pod adresem: http://localhost:9000${NC}"
echo -e "${YELLOW}Konsola MinIO jest dostępna pod adresem: http://localhost:9001${NC}"

echo -e "${YELLOW}Aby zatrzymać aplikację, użyj polecenia: docker-compose down${NC}"
