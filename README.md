# ⚡ Circuit Simulator

Interaktiver Schaltkreis-Simulator – gebaut mit **Angular 18**, **Tailwind CSS** und **DaisyUI**, vollständig containerisiert mit **Docker**.

---

## 🗂 Projektstruktur

```
Circuit-simulator/
├── frontend/               # Angular 18 Applikation
│   ├── src/
│   │   ├── app/            # Komponenten, Routen, Konfiguration
│   │   ├── styles.css      # Tailwind CSS Einstiegspunkt
│   │   └── index.html
│   ├── tailwind.config.js  # Tailwind + DaisyUI Konfiguration
│   ├── postcss.config.js
│   ├── angular.json
│   ├── Dockerfile          # Multi-stage: dev → build → prod (nginx)
│   └── nginx.conf          # SPA-Routing + Caching + Security-Header
├── docker-compose.yml      # Orchestrierung (dev + prod)
├── Makefile                # Shortcut-Befehle
└── .env.example            # Umgebungsvariablen (Ports)
```

---

## 🚀 Schnellstart

### Voraussetzungen
- [Docker](https://www.docker.com/) & Docker Compose v2

### Entwicklung (Hot-Reload)

```bash
# .env anlegen
cp .env.example .env

# Container starten
make dev
# oder: docker compose up --build
```

Öffne → **http://localhost:4200**

### Produktion (nginx)

```bash
make prod
# oder: docker compose --profile production up --build
```

Öffne → **http://localhost:8080**

---

## 📋 Makefile-Befehle

| Befehl        | Beschreibung                                      |
|---------------|---------------------------------------------------|
| `make dev`    | Dev-Server starten (hot-reload, Port 4200)        |
| `make prod`   | Produktion starten (nginx, Port 8080)             |
| `make build`  | Dev-Image bauen                                   |
| `make build-prod` | Produktions-Image bauen                       |
| `make down`   | Alle Container stoppen                            |
| `make logs`   | Container-Logs anzeigen                           |
| `make clean`  | Container, Volumes und Images entfernen           |

---

## 🛠 Tech Stack

| Layer      | Technologie                        |
|------------|------------------------------------|
| Framework  | Angular 18 (Standalone Components) |
| Styling    | Tailwind CSS 3 + DaisyUI 4         |
| Build      | esbuild / Angular CLI              |
| Dev Server | ng serve (Docker, Port 4200)       |
| Prod Server| nginx stable-alpine (Port 8080)    |
| Container  | Docker multi-stage Builds          |
A circuit simulator tool for different electronic devices.
