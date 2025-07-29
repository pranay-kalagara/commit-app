# Commit App - Development Commands

.PHONY: help build up down logs clean test

# Default target
help:
	@echo "Commit App - Available Commands:"
	@echo ""
	@echo "  make up          - Start all services in development mode"
	@echo "  make down        - Stop all services"
	@echo "  make build       - Build all Docker images"
	@echo "  make logs        - View logs from all services"
	@echo "  make logs-api    - View backend API logs"
	@echo "  make logs-db     - View database logs"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make test        - Run backend tests"
	@echo "  make shell-api   - Open shell in backend container"
	@echo "  make shell-db    - Open PostgreSQL shell"
	@echo ""

# Start development environment
up:
	@echo "🚀 Starting Commit App development environment..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Services started!"
	@echo "📍 Backend API: http://localhost:3000"
	@echo "📍 Database Admin: http://localhost:8080 (admin@commitapp.com / admin123)"
	@echo "📍 Redis Admin: http://localhost:8081"

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Build all images
build:
	@echo "🔨 Building Docker images..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build

# View logs
logs:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

logs-api:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

logs-db:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

# Run tests
test:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm test

# Open shells
shell-api:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh

shell-db:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U commit_user -d commit_dev

# Quick health check
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:3000/health | jq . || echo "❌ Backend not responding"
