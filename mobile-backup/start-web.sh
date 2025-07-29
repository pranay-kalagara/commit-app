#!/bin/sh

# Clear cache and start fresh
rm -rf .expo
rm -rf node_modules/.cache 2>/dev/null || true

# Start Expo with web support
echo "Starting Expo web server..."
npx expo start --web --port 19006 --host 0.0.0.0 --clear
