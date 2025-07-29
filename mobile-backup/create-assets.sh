#!/bin/bash

# Create a simple 1x1 transparent PNG as base64
TRANSPARENT_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="

# Create placeholder assets
echo "$TRANSPARENT_PNG" | base64 -d > assets/icon.png
echo "$TRANSPARENT_PNG" | base64 -d > assets/splash.png
echo "$TRANSPARENT_PNG" | base64 -d > assets/adaptive-icon.png
echo "$TRANSPARENT_PNG" | base64 -d > assets/favicon.png

echo "✅ Created placeholder assets:"
ls -la assets/
