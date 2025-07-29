#!/bin/bash

# Get the host machine's LAN IP address
HOST_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

echo "🚀 Starting Expo with HOST_IP: $HOST_IP"

# Export the HOST_IP environment variable and start Docker Compose
export HOST_IP=$HOST_IP
docker compose up -d mobile

echo "📱 Mobile QR code will show: exp://$HOST_IP:8081"
echo "🌐 Web interface will be available at: http://localhost:19006"
echo ""
echo "To start web server, run:"
echo "docker compose exec mobile npx expo start --web --port 19006"
