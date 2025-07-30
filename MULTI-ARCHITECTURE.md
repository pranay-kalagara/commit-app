# Multi-Architecture Support Guide

This project supports both **Intel (x86_64)** and **Apple Silicon (ARM64)** architectures, ensuring seamless development across different Mac types.

## 🏗️ Architecture Support

### Supported Platforms
- **Intel Macs** (x86_64/AMD64)
- **Apple Silicon Macs** (M1/M2/M3 - ARM64)
- **Linux** (both architectures)

### Docker Configuration
Our Docker setup automatically detects and builds for the correct architecture:

```yaml
# docker-compose.yml
services:
  backend:
    build:
      platforms:
        - linux/amd64  # Intel/x86_64
        - linux/arm64  # Apple Silicon/ARM64
  
  mobile:
    build:
      platforms:
        - linux/amd64
        - linux/arm64
```

## 🚀 Quick Setup for M1/M2 Mac Users

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./setup-docker.sh
```

### Option 2: Manual Setup
```bash
# 1. Enable Docker buildx for multi-platform builds
docker buildx create --name multiarch --driver docker-container --use
docker buildx inspect --bootstrap

# 2. Clean existing containers
docker compose down --remove-orphans
docker system prune -f

# 3. Build for your architecture
docker compose build --no-cache

# 4. Start services
docker compose up -d
```

## 🔧 Technical Implementation

### Backend (Node.js)
- Uses `--platform=$BUILDPLATFORM` in Dockerfile
- Node.js Alpine images support both architectures natively
- No architecture-specific dependencies

### Mobile (Flutter)
- **Important**: Flutter for Linux ARM64 is not officially available
- Uses x64 Flutter SDK with emulation on ARM64 hosts (M1/M2 Macs)
- Performance impact is minimal for development use
- Android SDK tools are architecture-agnostic
- Web development works perfectly on all architectures

### Database & Cache
- PostgreSQL and Redis use official multi-arch images
- No configuration changes needed

## 🐛 Troubleshooting

### Build Failures on M1/M2 Macs

**Problem**: "exec format error" or architecture mismatch
```bash
# Solution: Force rebuild with correct platform
docker compose build --no-cache --pull
```

**Problem**: `ERROR [linux/arm64->amd64] RUN flutter precache`
```bash
# This is expected - Flutter uses x64 emulation on ARM64
# Solution: Ensure Docker has enough resources allocated
# Docker Desktop → Settings → Resources → Advanced
# Increase Memory to at least 4GB and CPU to 4 cores
```

**Problem**: Flutter SDK download fails
```bash
# Check if buildx is enabled
docker buildx ls

# If not listed, create builder
docker buildx create --name multiarch --driver docker-container --use
```

### Performance Issues

**Problem**: Slow builds on M1/M2 Macs
```bash
# Use native ARM64 images when possible
# Our configuration already handles this automatically
```

### Verification Commands

```bash
# Check your system architecture
uname -m
# arm64 = Apple Silicon
# x86_64 = Intel

# Check Docker platform support
docker buildx ls

# Verify container architecture
docker compose exec backend uname -m
docker compose exec mobile uname -m
```

## 📋 Architecture Detection

The system automatically detects and configures for your architecture:

| System | Architecture | Docker Platform | Flutter SDK |
|--------|-------------|----------------|-------------|
| Intel Mac | x86_64 | linux/amd64 | x64 |
| M1/M2 Mac | arm64 | linux/arm64 | arm64 |
| Intel Linux | x86_64 | linux/amd64 | x64 |
| ARM Linux | aarch64 | linux/arm64 | arm64 |

## 🎯 Best Practices

1. **Always use the setup script** for new team members
2. **Clean build when switching architectures**:
   ```bash
   docker compose down
   docker system prune -f
   docker compose build --no-cache
   ```
3. **Use Docker Desktop** on Mac for best compatibility
4. **Enable Docker buildx** for multi-platform support
5. **Check logs** if builds fail:
   ```bash
   docker compose logs mobile
   ```

## 🔄 CI/CD Considerations

For production deployments, consider:
- Building separate images for each architecture
- Using Docker manifest lists for multi-arch distribution
- Testing on both architectures in CI pipeline

## 📞 Support

If you encounter architecture-related issues:
1. Run `./setup-m1-mac.sh` first
2. Check the troubleshooting section above
3. Verify your Docker Desktop version is up to date
4. Contact the team with your system info:
   ```bash
   uname -a
   docker --version
   docker compose version
   ```
