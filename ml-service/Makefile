.PHONY: help install dev run test check clean

help:
	@echo "================================================="
	@echo "          MindPulse ML Service Makefile          "
	@echo "================================================="
	@echo "  make install    - Install Python ML dependencies"
	@echo "  make dev        - Run FastAPI service with reload"
	@echo "  make run        - Run FastAPI production server"
	@echo "  make check      - Verify Python syntax & imports"
	@echo "  make clean      - Remove __pycache__ and cache files"
	@echo "================================================="

install:
	pip install -r requirements.txt

dev:
	python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

run:
	python -m uvicorn app.main:app --port 8000 --host 0.0.0.0

check:
	python -m py_compile app/config.py app/schemas/*.py app/services/*.py app/api/*.py app/main.py

clean:
	@echo "🧹 Cleaning Python cache files..."
	-rm -rf __pycache__ app/__pycache__ app/*/__pycache__ .pytest_cache
	@echo "✨ Clean complete."
