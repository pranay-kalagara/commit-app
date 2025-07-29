#!/bin/bash

echo "🚀 Starting Flutter Web Interface..."
echo ""
echo "This will start the Flutter web development server."
echo "Make sure the Flutter container is running first!"
echo ""

# Check if mobile container is running
if ! docker compose ps mobile | grep -q "Up"; then
    echo "⚠️  Mobile container is not running. Starting it..."
    docker compose up -d mobile
    sleep 3
fi

# Get the auto-assigned port
FLUTTER_PORT=$(docker compose port mobile 8080 2>/dev/null | cut -d: -f2)

if [ -n "$FLUTTER_PORT" ]; then
    echo "✅ Flutter web interface is available at: http://localhost:$FLUTTER_PORT"
    echo "📱 Opening in your default browser..."
    
    # Try to open in browser (macOS)
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:$FLUTTER_PORT"
    # Try to open in browser (Linux)
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$FLUTTER_PORT"
    else
        echo "Please manually open http://localhost:$FLUTTER_PORT in your browser"
    fi
else
    echo "❌ Could not determine Flutter web port. Check container status:"
    docker compose ps mobile
fi
