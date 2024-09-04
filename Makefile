# Makefile for Medusa Project

# Variables
DOCKER_COMPOSE = docker compose
NODE = node
NPM = npm
SLUG := "tbo-backend"

# Colors
YELLOW := "\033[33m"
RESET := "\033[0m"

# Default target
all: build

# Build the project
build:
	$(NPM) install
	$(NPM) run build

# Start the Medusa server
start:
	$(NPM) start

# Start the Medusa server in development mode
dev:
	$(NPM) run dev

# Run database migrations
migrate:
	$(NPM) run migrate

# Seed the database
seed:
	$(NPM) run seed

# Docker development
docker-dev:
	@echo "$(YELLOW)Starting docker environment...$(RESET)"
	$(DOCKER_COMPOSE) -p $(SLUG) up --build

# Docker update
docker-update:
	$(DOCKER_COMPOSE) -p $(SLUG) up --build -d

# Docker down
docker-down:
	@COMPOSE_PROJECT_NAME=$(SLUG) $(DOCKER_COMPOSE) down

# Build Docker images
docker-build:
	$(DOCKER_COMPOSE) build

# Clean up node_modules and build artifacts
clean:
	rm -rf node_modules
	rm -rf dist

# Run tests
test:
	$(NPM) test

# Lint the code
lint:
	$(NPM) run lint

# Format the code
format:
	$(NPM) run format

# Precommit with concurrency
precommit:
	npx concurrently --kill-others-on-fail --prefix "[{name}]" --names "frontend:format,frontend:lint" \
	--prefix-colors "bgRed.bold.white,bgGreen.bold.white,bgBlue.bold.white,bgYellow.bold.white" \
	"$(NPM) run format" \
	"$(NPM) run lint" 

# Help target
help:
	@echo "Available targets:"
	@echo "  build       - Install dependencies and build the project"
	@echo "  start       - Start the Medusa server"
	@echo "  dev         - Start the Medusa server in development mode"
	@echo "  migrate     - Run database migrations"
	@echo "  seed        - Seed the database"
	@echo "  docker-up   - Start Docker containers"
	@echo "  docker-down - Stop Docker containers"
	@echo "  docker-build- Build Docker images"
	@echo "  clean       - Remove node_modules and build artifacts"
	@echo "  test        - Run tests"
	@echo "  lint        - Lint the code"
	@echo "  format      - Format the code"

.PHONY: all build start dev migrate seed docker-up docker-down docker-build clean test lint format help
