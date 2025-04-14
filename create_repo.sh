#!/bin/bash

# Skrypt do utworzenia repozytorium GitHub

# Token GitHub
TOKEN="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"
ORG="optiq-ai"
REPO="yolo-coco"

# Tworzenie repozytorium
echo "Tworzenie repozytorium $ORG/$REPO..."
curl -X POST -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/$ORG/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"Aplikacja do detekcji obiektów na obrazach z wykorzystaniem YOLO i formatów COCO\",\"private\":false}"

# Inicjalizacja Git
cd /home/ubuntu/yolo-coco-project
git init

# Dodanie plików do repozytorium
git add .

# Pierwszy commit
git commit -m "Inicjalizacja projektu YOLO-COCO"

# Dodanie zdalnego repozytorium
git remote add origin https://$TOKEN@github.com/$ORG/$REPO.git

# Zmiana nazwy gałęzi z master na main
git branch -M main

# Push do repozytorium
git push -u origin main

# Utworzenie gałęzi dev
git checkout -b dev
git push -u origin dev

echo "Repozytorium zostało utworzone pomyślnie!"
