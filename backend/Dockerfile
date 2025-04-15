FROM python:3.10-slim

WORKDIR /app

# Kopiowanie plików wymagań
COPY requirements.txt .

# Instalacja zależności
RUN pip install --no-cache-dir -r requirements.txt

# Kopiowanie kodu aplikacji
COPY ./app /app/app

# Ustawienie zmiennych środowiskowych
ENV PYTHONPATH=/app
ENV PORT=8000

# Ekspozycja portu
EXPOSE 8000

# Uruchomienie aplikacji
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
