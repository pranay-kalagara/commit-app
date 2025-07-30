#!/bin/bash

# M1/M2 Mac Configuration Verification Script
# Run this to verify you have the correct Docker configuration

echo "🔍 M1/M2 Mac Configuration Verification"
echo "======================================"

# Check architecture
ARCH=$(uname -m)
echo "📋 System architecture: $ARCH"

if [[ "$ARCH" != "arm64" ]]; then
    echo "⚠️  This verification is for M1/M2 Macs (ARM64)"
    echo "   Your system appears to be Intel/x64"
fi

echo ""

# Check if files exist
echo "📁 Checking required files..."
files=("mobile/Dockerfile" "docker-compose.yml" "setup-docker.sh")
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""

# Check mobile Dockerfile configuration
echo "🔍 Checking mobile Dockerfile configuration..."
if [[ -f "mobile/Dockerfile" ]]; then
    if grep -q "dpkg --add-architecture amd64" mobile/Dockerfile; then
        echo "✅ Mobile Dockerfile: Correctly configured for x86_64 emulation on ARM64"
        if grep -q "libc6:amd64" mobile/Dockerfile; then
            echo "✅ Mobile Dockerfile: Has required x86_64 libraries"
        else
            echo "⚠️  Mobile Dockerfile: Missing some x86_64 libraries"
        fi
    elif grep -q "FROM --platform=linux/amd64" mobile/Dockerfile; then
        echo "⚠️  Mobile Dockerfile: Using old forced x64 approach"
        echo "   Consider updating to new multi-arch approach with x86_64 libraries"
    else
        echo "❌ Mobile Dockerfile: Not configured for M1/M2 compatibility"
        echo "   Needs x86_64 emulation setup for ARM64 hosts"
    fi
else
    echo "❌ mobile/Dockerfile not found"
fi

echo ""

# Check Docker Compose configuration
echo "🔍 Checking Docker Compose configuration..."
if [[ -f "docker-compose.yml" ]]; then
    if grep -A 10 "mobile:" docker-compose.yml | grep -q "platforms:"; then
        echo "❌ Docker Compose: Still has platform configuration for mobile"
        echo "   This should be removed for M1/M2 compatibility"
    else
        echo "✅ Docker Compose: Mobile service correctly configured"
    fi
    
    if grep -A 10 "backend:" docker-compose.yml | grep -q "platforms:"; then
        echo "✅ Docker Compose: Backend has multi-platform support"
    else
        echo "⚠️  Docker Compose: Backend missing platform configuration"
    fi
else
    echo "❌ docker-compose.yml not found"
fi

echo ""

# Check Docker version and buildx
echo "🐳 Checking Docker configuration..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
    
    # Check buildx
    if docker buildx version &> /dev/null; then
        echo "✅ Docker buildx: Available"
        
        # Check if multiarch builder exists
        if docker buildx ls | grep -q "multiarch"; then
            echo "✅ Buildx builder 'multiarch': Configured"
        else
            echo "⚠️  Buildx builder 'multiarch': Not configured"
            echo "   Run: docker buildx create --name multiarch --driver docker-container --use"
        fi
    else
        echo "❌ Docker buildx: Not available (update Docker Desktop)"
    fi
else
    echo "❌ Docker: Not installed"
fi

echo ""

# Summary and recommendations
echo "📋 SUMMARY AND RECOMMENDATIONS"
echo "=============================="

# Check if configuration is correct
dockerfile_ok=false
compose_ok=false

if [[ -f "mobile/Dockerfile" ]] && grep -q "FROM --platform=linux/amd64" mobile/Dockerfile; then
    dockerfile_ok=true
fi

if [[ -f "docker-compose.yml" ]] && ! grep -A 10 "mobile:" docker-compose.yml | grep -q "platforms:"; then
    compose_ok=true
fi

if [[ "$dockerfile_ok" == true ]] && [[ "$compose_ok" == true ]]; then
    echo "✅ Configuration appears correct for M1/M2 Mac"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Ensure Docker Desktop has 6GB+ memory and 4+ CPU cores"
    echo "   2. Run: ./fix-m1-build.sh (for complete rebuild)"
    echo "   3. Or run: ./setup-docker.sh (for normal setup)"
    echo ""
    echo "⏱️  Expected build time: 10-15 minutes (due to x64 emulation)"
    echo "📝 The message 'linux/arm64->amd64' during build is NORMAL"
else
    echo "❌ Configuration needs fixes for M1/M2 Mac"
    echo ""
    echo "🔧 Required fixes:"
    
    if [[ "$dockerfile_ok" != true ]]; then
        echo "   1. Fix mobile/Dockerfile:"
        echo "      Change: FROM --platform=\$TARGETPLATFORM ubuntu:22.04"
        echo "      To:     FROM --platform=linux/amd64 ubuntu:22.04"
    fi
    
    if [[ "$compose_ok" != true ]]; then
        echo "   2. Fix docker-compose.yml:"
        echo "      Remove 'platforms:' section from mobile service"
    fi
    
    echo ""
    echo "🚀 Quick fix: Run ./fix-m1-build.sh to auto-fix and rebuild"
fi

echo ""
echo "📞 Need help? Share this verification output with your team."
