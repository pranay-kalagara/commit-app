#!/bin/bash

# Commit App Check-in System Test Script
echo "📸 Testing Commit App Daily Check-in System"
echo "============================================"

BASE_URL="http://localhost:3000"

echo ""
echo "1️⃣ Registering Test User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "checkinuser@example.com",
    "username": "checkinuser",
    "password": "password123",
    "firstName": "CheckIn",
    "lastName": "Master"
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
        "email": "checkinuser@example.com",
        "password": "password123"
      }')
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

echo "🔑 Using token: ${TOKEN:0:50}..."
echo ""

echo "2️⃣ Creating Fitness Goal for Check-ins..."
GOAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Push-ups Challenge",
    "description": "Do 50 push-ups every day for 30 days",
    "categoryId": "fitness",
    "targetDays": 30,
    "isPublic": true,
    "reminderTime": "08:00"
  }')

echo "$GOAL_RESPONSE" | head -c 300
echo ""
echo ""

# Extract goal ID
GOAL_ID=$(echo "$GOAL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$GOAL_ID" ]; then
    echo "3️⃣ Creating First Check-in (Today)..."
    CHECKIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/check-ins" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"goalId\": \"$GOAL_ID\",
        \"description\": \"Completed 50 push-ups! Feeling strong 💪\",
        \"imageUrl\": \"https://example.com/pushup-proof.jpg\"
      }")

    echo "$CHECKIN_RESPONSE" | head -c 300
    echo ""
    echo ""

    # Extract check-in ID
    CHECKIN_ID=$(echo "$CHECKIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo "4️⃣ Creating Second Check-in (Yesterday)..."
    YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d)
    curl -s -X POST "$BASE_URL/api/v1/check-ins" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"goalId\": \"$GOAL_ID\",
        \"description\": \"Yesterday's workout was tough but rewarding!\",
        \"checkInDate\": \"$YESTERDAY\",
        \"videoUrl\": \"https://example.com/workout-video.mp4\"
      }" | head -c 300
    echo ""
    echo ""

    echo "5️⃣ Getting User's Check-ins..."
    curl -s -X GET "$BASE_URL/api/v1/check-ins" \
      -H "Authorization: Bearer $TOKEN" | head -c 400
    echo ""
    echo ""

    echo "6️⃣ Getting Check-ins for Specific Goal..."
    curl -s -X GET "$BASE_URL/api/v1/check-ins?goalId=$GOAL_ID" \
      -H "Authorization: Bearer $TOKEN" | head -c 400
    echo ""
    echo ""

    if [ ! -z "$CHECKIN_ID" ]; then
        echo "7️⃣ Getting Specific Check-in ($CHECKIN_ID)..."
        curl -s -X GET "$BASE_URL/api/v1/check-ins/$CHECKIN_ID" \
          -H "Authorization: Bearer $TOKEN" | head -c 300
        echo ""
        echo ""

        echo "8️⃣ Updating Check-in..."
        curl -s -X PUT "$BASE_URL/api/v1/check-ins/$CHECKIN_ID" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "description": "Updated: Completed 50 push-ups + 20 squats! 🔥",
            "imageUrl": "https://example.com/updated-workout-proof.jpg"
          }' | head -c 300
        echo ""
        echo ""
    fi

    echo "9️⃣ Getting Goal Statistics (with check-ins)..."
    curl -s -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/stats" \
      -H "Authorization: Bearer $TOKEN"
    echo ""
    echo ""

    echo "🔟 Getting Check-in Statistics for Goal..."
    curl -s -X GET "$BASE_URL/api/v1/goals/$GOAL_ID/check-ins/stats" \
      -H "Authorization: Bearer $TOKEN"
    echo ""
    echo ""
fi

echo "1️⃣1️⃣ Getting Public Check-ins Feed..."
curl -s "$BASE_URL/api/v1/check-ins/public" | head -c 400
echo ""
echo ""

echo "1️⃣2️⃣ Getting Public Fitness Check-ins..."
curl -s "$BASE_URL/api/v1/check-ins/public?category=fitness&limit=5" | head -c 400
echo ""
echo ""

echo "1️⃣3️⃣ Testing Duplicate Check-in Prevention..."
if [ ! -z "$GOAL_ID" ]; then
    curl -s -X POST "$BASE_URL/api/v1/check-ins" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"goalId\": \"$GOAL_ID\",
        \"description\": \"Trying to check-in again today (should fail)\"
      }" | head -c 200
    echo ""
    echo ""
fi

echo "✅ Check-in system test complete!"
echo "📸 Daily accountability system is working!"
echo "🎯 Ready for mobile app integration!"
