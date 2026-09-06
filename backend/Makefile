.PHONY: help install dev build start seed typecheck lint clean

help:
	@echo "================================================="
	@echo "           MindPulse Backend Makefile            "
	@echo "================================================="
	@echo "  make install    - Install backend dependencies"
	@echo "  make dev        - Start Express API with hot-reload"
	@echo "  make build      - Compile TypeScript to dist/"
	@echo "  make start      - Run compiled production server"
	@echo "  make seed       - Generate demo users & seed data"
	@echo "  make typecheck  - Check TypeScript types"
	@echo "  make lint       - Run ESLint"
	@echo "  make clean      - Remove dist and build artifacts"
	@echo "================================================="

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

seed:
	npm run seed

typecheck:
	npm run typecheck

lint:
	npm run lint

clean:
	@echo "🧹 Cleaning backend build..."
	-rm -rf dist
	@echo "✨ Clean complete."
