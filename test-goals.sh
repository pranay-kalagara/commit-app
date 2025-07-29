#!/bin/bash

# Commit App Goal Management Test Script
echo "🎯 Testing Commit App Goal Management System"
echo "============================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1️⃣ Testing Goal Categories..."
curl -s "$BASE_URL/api/v1/goals/categories" | head -c 300
echo ""
echo ""

echo "2️⃣ Registering Test User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "goaluser@example.com",
    "username": "goaluser",
    "password": "password123",
    "firstName": "Goal",
    "lastName": "Setter"
  }')

echo "$REGISTER_RESPONSE" | head -c 200
echo ""
echo ""

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token, trying login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "goaluser@example.com",
        "password": "password123"
      }')
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

echo "🔑 Using token: ${TOKEN:0:50}..."
echo ""

echo "3️⃣ Creating Fitness Goal..."
GOAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Morning Workout",
    "description": "30 minutes of exercise every morning",
    "categoryId": "fitness",
    "targetDays": 30,
    "isPublic": true,
    "reminderTime": "07:00"
  }')

echo "$GOAL_RESPONSE" | head -c 300
echo ""
echo ""

# Extract goal ID
GOAL_ID=$(echo "$GOAL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "4️⃣ Creating Learning Goal..."
curl -s -X POST "$BASE_URL/api/v1/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn JavaScript",
    "description": "Study JavaScript for 1 hour daily",
    "categoryId": "learning",
    "targetDays": 60,
    "isPublic": false,
    "reminderTime": "19:00"
  }' | head -c 300
echo ""
echo ""

echo "5️⃣ Getting User's Goals..."
curl -s -X GET "$BASE_URL/api/v1/goals" \
  -H "Authorization: Bearer $TOKEN" | head -c 400
echo ""
echo ""

if [ ! -z "$GOAL_ID" ]; then
    echo "6️⃣ Getting Specific Goal ($GOAL_ID)..."
    curl -s -X GET "$BASE_URL/api/v1/goals/$GOAL_ID" \
      -H "Authorization: Bearer $TOKEN" | head -c 300
    echo ""
    echo ""

    echo "7️⃣ Getting Goal Statistics..."
    curl -s -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/stats" \
      -H "Authorization: Bearer $TOKEN"
    echo ""
    echo ""

    echo "8️⃣ Updating Goal..."
    curl -s -X PUT "$BASE_URL/api/v1/goals/$GOAL_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "description": "Updated: 45 minutes of intense morning workout",
        "targetDays": 45
      }' | head -c 300
    echo ""
    echo ""
fi

echo "9️⃣ Getting Public Goals..."
curl -s "$BASE_URL/api/v1/goals/public" | head -c 400
echo ""
echo ""

echo "🔟 Getting Public Fitness Goals..."
curl -s "$BASE_URL/api/v1/goals/public?category=fitness&limit=5" | head -c 400
echo ""
echo ""

echo "✅ Goal management test complete!"
echo "🎯 Ready for check-in system implementation!"
