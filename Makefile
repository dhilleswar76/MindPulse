.PHONY: help install dev dev-backend dev-frontend dev-ml build seed lint typecheck docker-up docker-down clean

help:
	@echo "========================================================================"
	@echo "                       MindPulse Makefile                              "
	@echo "========================================================================"
	@echo "  make install       - Install dependencies for root, backend, frontend, ML"
	@echo "  make dev           - Run Frontend, Backend, and ML Microservice concurrently"
	@echo "  make dev-backend   - Run Express Backend API only"
	@echo "  make dev-frontend  - Run Vite Frontend only"
	@echo "  make dev-ml        - Run FastAPI Python ML service only"
	@echo "  make build         - Compile backend and frontend for production"
	@echo "  make seed          - Generate synthetic seed data and demo users"
	@echo "  make lint          - Lint backend and frontend codebases"
	@echo "  make typecheck     - Run TypeScript type checks on backend and frontend"
	@echo "  make docker-up     - Launch full multi-container stack with Docker Compose"
	@echo "  make docker-down   - Stop all Docker Compose containers"
	@echo "  make clean         - Remove dist, build artifacts, and caches"
	@echo "========================================================================"

install:
	@echo "📦 Installing root & workspace dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install
	cd ml-service && pip install -r requirements.txt
	@echo "✅ All dependencies installed."

dev:
	npm run dev

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

dev-ml:
	cd ml-service && python -m uvicorn app.main:app --reload --port 8000

build:
	cd backend && npm run build
	cd frontend && npm run build

seed:
	cd backend && npm run seed

lint:
	npm run lint

typecheck:
	npm run typecheck

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	@echo "🧹 Cleaning build artifacts..."
	-rm -rf backend/dist frontend/dist
	-rm -rf .coverage .pytest_cache
	@echo "✨ Clean complete."
