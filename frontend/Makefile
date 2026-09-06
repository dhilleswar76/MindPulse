.PHONY: help install dev build lint typecheck preview clean

help:
	@echo "================================================="
	@echo "           MindPulse Frontend Makefile           "
	@echo "================================================="
	@echo "  make install    - Install frontend dependencies"
	@echo "  make dev        - Start Vite development server"
	@echo "  make build      - Build production distribution"
	@echo "  make typecheck  - Check TypeScript types"
	@echo "  make lint       - Run ESLint"
	@echo "  make preview    - Preview built production assets"
	@echo "  make clean      - Remove dist and node_modules/.vite"
	@echo "================================================="

install:
	npm install

dev:
	npm run dev

build:
	npm run build

typecheck:
	npm run typecheck

lint:
	npm run lint

preview:
	npm run preview

clean:
	@echo "🧹 Cleaning frontend build..."
	-rm -rf dist node_modules/.vite
	@echo "✨ Clean complete."
