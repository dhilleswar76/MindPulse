.PHONY: help install dev build start clean

help:
	@echo "================================================="
	@echo "          MindPulse Workers Makefile             "
	@echo "================================================="
	@echo "  make install    - Install worker dependencies"
	@echo "  make dev        - Run BullMQ workers in dev mode"
	@echo "  make build      - Compile TypeScript worker code"
	@echo "  make start      - Run compiled worker process"
	@echo "  make clean      - Remove dist/"
	@echo "================================================="

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	-rm -rf dist
