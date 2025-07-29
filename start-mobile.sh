#!/bin/bash

echo "🚀 Starting Flutter Mobile Development Environment"
echo ""

# Start the Flutter mobile container
docker compose up -d mobile

# Get the auto-assigned port for Flutter web
FLUTTER_PORT=$(docker compose port mobile 8080 2>/dev/null | cut -d: -f2)

if [ -n "$FLUTTER_PORT" ]; then
    echo "✅ Flutter web interface available at: http://localhost:$FLUTTER_PORT"
else
    echo "⚠️  Flutter web port not yet assigned. Check 'docker compose ps' for the port."
fi

echo "📱 For mobile development:"
echo "   1. Install Flutter SDK locally"
echo "   2. Run 'flutter run' in the mobile directory"
echo "   3. Connect your device or start an emulator"
echo ""
echo "🔧 Development commands:"
echo "   - View logs: docker compose logs -f mobile"
echo "   - Restart: docker compose restart mobile"
echo "   - Shell access: docker compose exec mobile bash"
