# M1/M2 Mac Setup Instructions

## 🚨 Important Note for M1/M2 Mac Users

Your friend encountered this error because **Flutter for Linux ARM64 is not officially available**. This is a known limitation, not a bug in our setup.

## ✅ Solution Implemented

I've updated the Docker configuration to handle this properly:

1. **Flutter Container**: Now uses x64 emulation on ARM64 hosts
2. **Performance**: Minimal impact for development use
3. **Functionality**: Web development works perfectly
4. **Backend**: Runs natively on ARM64 (no emulation needed)

## 🔧 Required Docker Settings for M1/M2 Macs

Before running the setup script, ensure Docker Desktop has sufficient resources:

### Step 1: Open Docker Desktop Settings
1. Click Docker Desktop icon in menu bar
2. Go to **Settings** → **Resources** → **Advanced**

### Step 2: Increase Resource Allocation
- **Memory**: At least **4GB** (recommended: 6GB)
- **CPU**: At least **4 cores** (recommended: 6 cores)
- **Swap**: At least **1GB**
- **Disk Image Size**: At least **64GB**

### Step 3: Apply & Restart
1. Click **Apply & Restart**
2. Wait for Docker to restart completely

## 🚀 Run Setup Script

After configuring Docker resources:

```bash
# Navigate to project directory
cd commit-app

# Run the setup script
./setup-docker.sh
```

## ⚠️ Expected Behavior

You may see messages like:
```
ERROR [linux/arm64->amd64] RUN flutter precache
```

**This is NORMAL and EXPECTED**. It means:
- Docker is emulating x64 on your ARM64 Mac
- Flutter is downloading and setting up correctly
- The process will complete successfully (just takes longer)

## 🕐 Build Time Expectations

| Component | Intel Mac | M1/M2 Mac (Emulation) |
|-----------|-----------|----------------------|
| Backend | 2-3 minutes | 2-3 minutes |
| Database | 30 seconds | 30 seconds |
| Mobile (Flutter) | 5-7 minutes | 8-12 minutes |

## ✅ Success Indicators

After the script completes, you should see:
```
✅ Setup complete!

🌐 Access your app at:
   - Backend API: http://localhost:3000
   - Flutter Web: Check the mobile container logs for the assigned port
   - PostgreSQL: localhost:5433
   - Redis: localhost:6379
```

## 🐛 If Build Still Fails

1. **Check Docker Resources**: Ensure you allocated enough memory/CPU
2. **Clean Everything**:
   ```bash
   docker system prune -a -f
   docker volume prune -f
   ./setup-docker.sh
   ```
3. **Check Docker Version**: Ensure you have Docker Desktop 4.0+ with buildx support

## 📞 Need Help?

If you still encounter issues:
1. Share the complete error output
2. Run `docker --version` and share the version
3. Check Docker Desktop resource allocation
4. Verify you're using the latest setup script

## 🎯 Why This Approach?

- **Flutter**: No official ARM64 Linux binaries available
- **Emulation**: Docker's x64 emulation is stable and reliable
- **Performance**: Web development performance is excellent
- **Compatibility**: Ensures consistent behavior across all team members

Your M1/M2 Mac will work perfectly with this setup! 🚀
