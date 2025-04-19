FROM node:20-alpine as build
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie kodu źródłowego
COPY . .

# Dodanie zmiennej środowiskowej dla React
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Budowanie aplikacji
RUN npm run build

# Etap produkcyjny
FROM nginx:alpine

# Kopiowanie plików statycznych z etapu budowania
COPY --from=build /app/build /usr/share/nginx/html

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspozycja portu
EXPOSE 80

# Uruchomienie Nginx
CMD ["nginx", "-g", "daemon off;"]
