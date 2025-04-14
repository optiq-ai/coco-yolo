#!/bin/bash

# Skrypt do wdrożenia projektu YOLO-COCO na GitHub

# Kolory do wyświetlania komunikatów
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Rozpoczynam wdrażanie projektu YOLO-COCO na GitHub...${NC}"

# Sprawdzenie, czy git jest zainstalowany
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git nie jest zainstalowany. Proszę zainstalować Git przed kontynuowaniem.${NC}"
    exit 1
fi

# Sprawdzenie, czy jesteśmy w katalogu projektu
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Nie jesteś w katalogu projektu. Przejdź do katalogu projektu przed kontynuowaniem.${NC}"
    exit 1
fi

# Inicjalizacja repozytorium Git (jeśli jeszcze nie istnieje)
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Inicjalizacja repozytorium Git...${NC}"
    git init
fi

# Dodanie wszystkich plików do repozytorium
echo -e "${YELLOW}Dodawanie plików do repozytorium...${NC}"
git add .

# Utworzenie commita
echo -e "${YELLOW}Tworzenie commita...${NC}"
git commit -m "Inicjalna wersja projektu YOLO-COCO"

# Sprawdzenie, czy token GitHub jest dostępny
if [ -z "$GITHUB_TOKEN" ]; then
    # Użycie domyślnego tokena
    GITHUB_TOKEN="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"
    echo -e "${YELLOW}Używam domyślnego tokena GitHub.${NC}"
fi

# Sprawdzenie, czy nazwa organizacji jest dostępna
if [ -z "$GITHUB_ORG" ]; then
    # Użycie domyślnej organizacji
    GITHUB_ORG="optiq-ai"
    echo -e "${YELLOW}Używam domyślnej organizacji GitHub: $GITHUB_ORG${NC}"
fi

# Sprawdzenie, czy nazwa repozytorium jest dostępna
if [ -z "$GITHUB_REPO" ]; then
    # Użycie domyślnej nazwy repozytorium
    GITHUB_REPO="yolo-coco-project"
    echo -e "${YELLOW}Używam domyślnej nazwy repozytorium GitHub: $GITHUB_REPO${NC}"
fi

# Utworzenie repozytorium na GitHub
echo -e "${YELLOW}Tworzenie repozytorium na GitHub...${NC}"
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/$GITHUB_ORG/repos \
  -d "{\"name\":\"$GITHUB_REPO\",\"private\":true}" > /dev/null

# Dodanie zdalnego repozytorium
echo -e "${YELLOW}Dodawanie zdalnego repozytorium...${NC}"
git remote add origin https://github.com/$GITHUB_ORG/$GITHUB_REPO.git

# Wysłanie kodu do GitHub
echo -e "${YELLOW}Wysyłanie kodu do GitHub...${NC}"
git push -u origin master

echo -e "${GREEN}Wdrażanie projektu na GitHub zakończone pomyślnie!${NC}"
echo -e "${YELLOW}Repozytorium jest dostępne pod adresem: https://github.com/$GITHUB_ORG/$GITHUB_REPO${NC}"
