# Variables
DOCKER_COMPOSE = docker compose
NODE = node
NPM = npm
SLUG := "tbo-backend"
DOCKER_HUB := beafdocker
GCP_PROJECT_ID := "sigma-chemist-435211-m4"

# Colors
YELLOW = $(shell tput -Txterm setaf 3)
RESET = $(shell tput -Txterm sgr0)

# Default target
all: build

# Build the project
build:
	$(NPM) install
	$(NPM) run build

start:
	$(NPM) start

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


prep:
	npx medusa user -e teebarg01@gmail.com -p password

# Backend Deployment
build: ## Build docker image for the project
	@echo "$(YELLOW)Building project image...$(RESET)"
	docker build -f Dockerfile.prod -t $(SLUG) .

stage: ## Prepare postges database
	@echo "$(YELLOW)Staging for deployment...$(RESET)"
	docker tag $(SLUG):latest $(DOCKER_HUB)/$(SLUG):latest
	docker push $(DOCKER_HUB)/$(SLUG):latest


deploy-gcp: ## Deploy to Google Cloud Platform
	@echo "$(YELLOW)Deploying to GCP...$(RESET)"
	@if [ -z "$(GCP_PROJECT_ID)" ]; then \
		echo "$(RED)Error: GCP_PROJECT_ID is not set. Please set it in your environment.$(RESET)"; \
		exit 1; \
	fi
	# @gcloud auth login
	# @gcloud config set project $(GCP_PROJECT_ID)
	@gcloud run deploy $(SLUG) \
		--image $(DOCKER_HUB)/$(SLUG):latest \
		--platform managed \
		--region us-central1 \
		--allow-unauthenticated \
		--env-vars-file env.yaml \
		--project=$(GCP_PROJECT_ID)
	@echo "$(GREEN)Deployment completed. Please check the Google Cloud Console for details.$(RESET)"
	@echo "$(YELLOW)If deployment fails, check container logs for more information:$(RESET)"
	@echo "gcloud run logs read --service=$(SLUG) --project=$(GCP_PROJECT_ID)"


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
	@echo "  start       - Start the server"
	@echo "  dev         - Start the server in development mode"
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
