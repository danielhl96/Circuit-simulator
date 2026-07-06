.PHONY: dev prod build build-prod down logs clean install help

# ─────────────────────────────────────────────────────────────────────────────
# Circuit Simulator – Makefile
# ─────────────────────────────────────────────────────────────────────────────

## Start development server with hot-reload → http://localhost:4200
dev:
	docker compose up --build

## Start production nginx server → http://localhost:8080
prod:
	docker compose --profile production up --build

## Build dev image only
build:
	docker compose build frontend

## Build production image only
build-prod:
	docker compose --profile production build frontend-prod

## Stop all running containers
down:
	docker compose --profile production down

## Tail logs of running containers
logs:
	docker compose logs -f

## Remove containers, named volumes and built images
clean:
	docker compose --profile production down -v --rmi all

## Run npm install inside the dev container
install:
	docker compose run --rm frontend npm install

## Show this help
help:
	@grep -E '^##' $(MAKEFILE_LIST) | sed 's/## /  /'
