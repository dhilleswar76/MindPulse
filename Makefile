.PHONY: help install dev dev-backend dev-frontend dev-ml dev-workers build build-backend build-frontend build-workers seed lint typecheck docker-up docker-down clean

help:
	@echo "========================================================================"
	@echo "                       MindPulse Root Makefile                          "
	@echo "========================================================================"
	@echo "  UNIFIED COMMANDS:"
	@echo "    make install          - Install all dependencies (Root, Backend, Frontend, ML)"
	@echo "    make dev              - Run Frontend, Backend, and ML Microservice concurrently"
	@echo "    make build            - Build backend and frontend for production"
	@echo "    make seed             - Seed database with synthetic demo accounts"
	@echo "    make lint             - Run linting on all services"
	@echo "    make typecheck        - Run TypeScript verification on all services"
	@echo "    make docker-up        - Launch multi-container stack with Docker Compose"
	@echo "    make docker-down      - Stop Docker Compose stack"
	@echo "    make clean            - Clean all build outputs and caches"
	@echo ""
	@echo "  MODULAR SERVICE TARGETS:"
	@echo "    make dev-frontend     - Start Frontend (React + Vite)"
	@echo "    make dev-backend      - Start Backend API (Express + TS)"
	@echo "    make dev-ml           - Start ML Microservice (FastAPI + Python)"
	@echo "    make dev-workers      - Start Background Workers (BullMQ)"
	@echo "    make build-frontend   - Build Frontend only"
	@echo "    make build-backend    - Build Backend only"
	@echo "    make build-workers    - Build Workers only"
	@echo "========================================================================"

install:
	@echo "📦 Installing root & component dependencies..."
	npm install
	$(MAKE) -C backend install
	$(MAKE) -C frontend install
	$(MAKE) -C ml-service install
	@echo "✅ All dependencies installed."

dev:
	npm run dev

dev-backend:
	$(MAKE) -C backend dev

dev-frontend:
	$(MAKE) -C frontend dev

dev-ml:
	$(MAKE) -C ml-service dev

dev-workers:
	$(MAKE) -C workers dev

build:
	$(MAKE) -C backend build
	$(MAKE) -C frontend build

build-frontend:
	$(MAKE) -C frontend build

build-backend:
	$(MAKE) -C backend build

build-workers:
	$(MAKE) -C workers build

seed:
	$(MAKE) -C backend seed

lint:
	npm run lint

typecheck:
	npm run typecheck

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	@echo "🧹 Cleaning all component build artifacts..."
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	$(MAKE) -C ml-service clean
	@echo "✨ All components clean."
