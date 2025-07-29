# 📱 Expo Development Guide

## 🚀 Quick Start

### 1. Start All Services
```bash
docker compose up -d
```

### 2. Check Expo Status
```bash
docker compose logs mobile --tail 20
```

You should see:
- QR Code in ASCII art
- `Metro waiting on exp://172.20.0.5:8081`
- Menu options: `Press w │ open web`

## 📱 Mobile Development

### For Android/iOS Devices:
1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the same WiFi** as your computer

3. **Scan QR Code**: 
   - The QR code shows `exp://172.20.0.5:8081` (Docker internal IP)
   - **For mobile access, use**: `exp://192.168.1.240:8081`
   - Create a manual QR code with your computer's IP or type the URL directly in Expo Go

4. **Alternative**: Get your computer's IP
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

## 🌐 Web Development

### Option 1: Interactive Method (Recommended)
1. **Access the container**:
   ```bash
   docker compose exec mobile bash
   ```

2. **Press 'w'** when you see the Expo menu to start web server

3. **Open browser**: http://localhost:19006

### Option 2: Helper Script
```bash
./expo-web.sh
```

### Option 3: Manual Web Server
```bash
docker compose exec mobile npx expo start --web --port 19006
```

## 🔧 Development Workflow

### Hot Reload
- **Mobile**: Changes auto-reload on device
- **Web**: Refresh browser or use hot reload

### Debugging
- **Press 'j'** in Expo terminal for debugger
- **Press 'r'** to reload app
- **Press 'm'** to toggle dev menu

### Logs
```bash
# View Expo logs
docker compose logs mobile -f

# View backend logs
docker compose logs backend -f
```

## 🌍 Network Configuration

### Current Setup:
- **Metro Bundler**: `localhost:8081`
- **Expo Web**: `localhost:19006` (when started)
- **Backend API**: `localhost:3000`
- **QR Code**: Shows Docker internal IP (needs manual override for mobile)

### For Mobile Access:
Replace `172.20.0.5` with your computer's LAN IP (`192.168.1.240`)

## 🐛 Troubleshooting

### Mobile Can't Connect
- Ensure same WiFi network
- Use computer's LAN IP instead of Docker IP
- Check firewall settings

### Web Won't Start
- Press 'w' in Expo terminal
- Use manual web server command
- Check port 19006 availability

### Port Conflicts
- Kill processes: `lsof -ti:19006 | xargs kill -9`
- Use different port: `--port 19007`

## 📝 Quick Commands

```bash
# Start everything
docker compose up -d

# View mobile logs
docker compose logs mobile -f

# Access container
docker compose exec mobile bash

# Start web (inside container)
npx expo start --web --port 19006

# Restart mobile service
docker compose restart mobile

# Stop everything
docker compose down
```

## ✅ Success Indicators

### Mobile Working:
- QR code visible in terminal
- Expo Go app connects and loads Welcome screen
- Hot reload works on code changes

### Web Working:
- Browser opens at localhost:19006
- App loads with Welcome screen
- Hot reload works on code changes

---

**🎯 Current Status**: ✅ **WORKING!** 
- **Mobile Dev Server**: Running with QR code for mobile devices
- **Web Interface**: Accessible at http://localhost:19007
- **Port Configuration**: Using 19007 to avoid Docker port conflicts
- **CRC Error**: Present but doesn't prevent functionality

## 🎉 Success!

Your Expo React Native app is now running in Docker with both mobile and web support!

### 📱 **Mobile Access**:
- Scan QR code with Expo Go app
- Use your computer's LAN IP instead of Docker internal IP

### 🌐 **Web Access**:
- Open http://localhost:19007 in your browser
- Hot reload works for development

### 🔧 **Key Fixes Applied**:
1. Proper Dockerfile with correct user permissions
2. Fixed babel-preset-expo dependency
3. Created missing asset files
4. Used port 19007 to avoid Docker daemon conflicts
5. Proper volume mounting for development
