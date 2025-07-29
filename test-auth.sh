#!/bin/bash

# Commit App Authentication Test Script
echo "🧪 Testing Commit App Authentication System"
echo "=========================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1️⃣ Testing Health Check..."
curl -s "$BASE_URL/health" | head -c 200
echo ""
echo ""

echo "2️⃣ Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alicesmith",
    "password": "securepass123",
    "firstName": "Alice",
    "lastName": "Smith"
  }')

echo "$REGISTER_RESPONSE" | head -c 300
echo ""
echo ""

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "3️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }')

echo "$LOGIN_RESPONSE" | head -c 300
echo ""
echo ""

echo "4️⃣ Testing Protected Endpoint (/me)..."
curl -s -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo ""
echo ""

echo "5️⃣ Testing Profile Update..."
curl -s -X PUT "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Daily accountability champion! 💪",
    "timezone": "America/Los_Angeles"
  }' | head -c 300
echo ""
echo ""

echo "6️⃣ Testing All Users (Dev Endpoint)..."
curl -s "$BASE_URL/api/v1/dev/users"
echo ""
echo ""

echo "7️⃣ Testing Logout..."
curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "8️⃣ Testing Access After Logout (should fail)..."
curl -s -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "✅ Authentication test complete!"
echo "📱 Ready for mobile app integration!"
