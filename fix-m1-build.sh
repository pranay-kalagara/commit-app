#!/bin/bash

# M1/M2 Mac Build Fix Script
# This script completely cleans Docker and rebuilds with proper M1 configuration

echo "🔧 M1/M2 Mac Docker Build Fix Script"
echo "=================================="

# Check if running on M1/M2 Mac
ARCH=$(uname -m)
if [[ "$ARCH" != "arm64" ]]; then
    echo "⚠️  This script is designed for M1/M2 Macs (ARM64)"
    echo "   Your architecture: $ARCH"
    echo "   You may not need this script."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 System Info:"
echo "   Architecture: $ARCH"
echo "   Docker: $(docker --version)"
echo "   Docker Compose: $(docker compose version)"
echo ""

# Step 1: Complete Docker cleanup
echo "🧹 Step 1: Complete Docker cleanup..."
echo "   This will remove ALL Docker containers, images, and volumes"
read -p "   Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled. Cannot proceed without cleanup."
    exit 1
fi

# Stop all containers
echo "   Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove all containers
echo "   Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove all images
echo "   Removing all images..."
docker rmi $(docker images -q) -f 2>/dev/null || true

# Remove all volumes
echo "   Removing all volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Remove all networks
echo "   Removing custom networks..."
docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true

# System prune
echo "   Final cleanup..."
docker system prune -a -f --volumes

echo "✅ Docker cleanup complete"
echo ""

# Step 2: Remove buildx builder
echo "🔨 Step 2: Reset Docker buildx..."
docker buildx rm multiarch 2>/dev/null || true
docker buildx create --name multiarch --driver docker-container --use
docker buildx inspect --bootstrap

echo "✅ Buildx reset complete"
echo ""

# Step 3: Check Docker resource allocation
echo "📊 Step 3: Docker resource check..."
echo "   Please verify Docker Desktop settings:"
echo "   Settings → Resources → Advanced"
echo "   - Memory: 6GB+ (minimum 4GB)"
echo "   - CPU: 6+ cores (minimum 4 cores)"
echo "   - Swap: 1GB+"
echo ""
read -p "   Have you configured Docker resources? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please configure Docker resources first:"
    echo "   1. Open Docker Desktop"
    echo "   2. Go to Settings → Resources → Advanced"
    echo "   3. Set Memory to 6GB, CPU to 6 cores"
    echo "   4. Click Apply & Restart"
    echo "   5. Run this script again"
    exit 1
fi

# Step 4: Verify Dockerfile configuration
echo "🔍 Step 4: Verifying Dockerfile configuration..."
if grep -q "dpkg --add-architecture amd64" mobile/Dockerfile; then
    echo "✅ Mobile Dockerfile correctly configured for x86_64 emulation"
else
    echo "❌ Mobile Dockerfile needs fixing..."
    echo "   This requires manual update - the new Dockerfile includes:"
    echo "   - Multi-architecture base image"
    echo "   - x86_64 library installation for ARM64 hosts"
    echo "   - Enhanced Flutter precache with debugging"
    echo "   Please pull the latest changes from the repository."
    exit 1
fi

# Step 5: Build with verbose output
echo "🏗️  Step 5: Building with verbose output..."
echo "   This may take 10-15 minutes on M1/M2 Macs due to emulation"
echo "   The message 'linux/arm64->amd64' is NORMAL and EXPECTED"
echo ""

# Build with no cache and verbose output
DOCKER_BUILDKIT=1 docker compose build --no-cache --progress=plain mobile

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Mobile container built successfully!"
    echo ""
    
    # Build other services
    echo "🏗️  Building other services..."
    docker compose build --no-cache backend postgres redis
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ All containers built successfully!"
        echo ""
        
        # Start services
        echo "🚀 Starting services..."
        docker compose up -d
        
        # Wait for services
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        # Show status
        echo "📊 Service status:"
        docker compose ps
        
        echo ""
        echo "🎉 SUCCESS! Your M1/M2 Mac setup is working!"
        echo ""
        echo "🌐 Access your app:"
        FLUTTER_PORT=$(docker compose port mobile 8080 | cut -d: -f2)
        echo "   - Backend API: http://localhost:3000"
        echo "   - Flutter Web: http://localhost:$FLUTTER_PORT"
        echo "   - PostgreSQL: localhost:5433"
        echo "   - Redis: localhost:6379"
        echo ""
        echo "📱 To view mobile logs: docker compose logs -f mobile"
        
    else
        echo "❌ Failed to build other services"
        echo "📝 Check logs: docker compose logs"
        exit 1
    fi
else
    echo ""
    echo "❌ Mobile container build failed"
    echo ""
    echo "🔍 Common issues:"
    echo "   1. Insufficient Docker resources (increase memory/CPU)"
    echo "   2. Network issues (try again)"
    echo "   3. Docker version too old (update Docker Desktop)"
    echo ""
    echo "📝 Full build logs above - look for specific error messages"
    echo "📞 Share the complete error output for further help"
    exit 1
fi
