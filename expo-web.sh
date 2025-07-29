#!/bin/bash

echo "🚀 Starting Expo Web Interface..."
echo ""
echo "This will open the web version of your Expo app."
echo "Make sure the Expo dev server is running first!"
echo ""

# Send 'w' command to the Expo server to start web
echo "w" | docker compose exec -T mobile sh -c 'cat > /proc/1/fd/0' 2>/dev/null || {
    echo "⚠️  Could not send 'w' command directly. Starting web server manually..."
    docker compose exec mobile npx expo start --web --port 19006
}

echo ""
echo "✅ Web interface should be starting..."
echo "📱 Open http://localhost:19006 in your browser"
