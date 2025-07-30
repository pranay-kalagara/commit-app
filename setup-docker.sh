#!/bin/bash

# Setup script for all Mac users (Intel and Apple Silicon)
# This script ensures proper Docker configuration for any architecture

echo "🚀 Setting up Commit app for Mac (auto-detecting architecture)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop for Mac."
    echo "   Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please update Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed"

# Check Docker version
DOCKER_VERSION=$(docker --version)
echo "📋 $DOCKER_VERSION"

# Check Docker Compose version
COMPOSE_VERSION=$(docker compose version)
echo "📋 $COMPOSE_VERSION"

# Check system architecture
ARCH=$(uname -m)
echo "📋 System architecture: $ARCH"

if [[ "$ARCH" == "arm64" ]]; then
    echo "✅ Detected ARM64 architecture (M1/M2 Mac)"
else
    echo "⚠️  Detected $ARCH architecture (not M1/M2 Mac)"
fi

# Enable Docker buildx for multi-platform builds
echo "🔧 Enabling Docker buildx for multi-platform builds..."
docker buildx create --name multiarch --driver docker-container --use 2>/dev/null || true
docker buildx inspect --bootstrap

# Clean up any existing containers and images
echo "🧹 Cleaning up existing containers and images..."
docker compose down --remove-orphans 2>/dev/null || true
docker system prune -f

# Build images for the correct architecture
echo "🏗️  Building images for detected architecture ($ARCH)..."
docker compose build --no-cache

# Start the services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service status:"
docker compose ps

# Show logs
echo "📝 Recent logs:"
docker compose logs --tail=20

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your app at:"
echo "   - Backend API: http://localhost:3000"
echo "   - Flutter Web: Check the mobile container logs for the assigned port"
echo "   - PostgreSQL: localhost:5433"
echo "   - Redis: localhost:6379"
echo ""
echo "📱 To view mobile app logs:"
echo "   docker compose logs -f mobile"
echo ""
echo "🛠️  To rebuild if needed:"
echo "   docker compose build --no-cache"
echo ""
