# Commit App - Backend API Specification

## API Overview
- **Base URL**: `https://api.commitapp.com/v1`
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **File Uploads**: `multipart/form-data`

## Authentication Endpoints

### POST /auth/register
Register a new user account.
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Response**: `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/login
Authenticate user and get access token.
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### POST /auth/refresh
Refresh expired access token.
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
Invalidate current session.

## User Endpoints

### GET /users/me
Get current user profile.

### PUT /users/me
Update current user profile.
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Fitness enthusiast and lifelong learner",
  "timezone": "America/New_York"
}
```

### POST /users/me/avatar
Upload profile picture.
**Content-Type**: `multipart/form-data`

### GET /users/{userId}
Get public user profile.

### GET /users/search?q={query}
Search for users by username or name.

## Goals Endpoints

### GET /goals
Get current user's goals.
**Query Parameters**:
- `status`: `active`, `completed`, `paused` (default: `active`)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response**:
```json
{
  "goals": [
    {
      "id": "uuid",
      "title": "Daily Gym Workout",
      "description": "Get fit and build strength",
      "category": {
        "id": 1,
        "name": "Fitness",
        "icon": "💪",
        "color": "#FF6B6B"
      },
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "status": "active",
      "currentStreak": 5,
      "longestStreak": 8,
      "totalDays": 31,
      "daysElapsed": 15,
      "checkInsCount": 12,
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /goals
Create a new goal.
```json
{
  "title": "Learn Spanish Daily",
  "description": "Practice Spanish for 30 minutes every day",
  "categoryId": 2,
  "startDate": "2024-01-01",
  "endDate": "2024-03-01",
  "targetFrequency": 1,
  "isPublic": true
}
```

### GET /goals/{goalId}
Get specific goal details.

### PUT /goals/{goalId}
Update goal details.

### DELETE /goals/{goalId}
Delete a goal.

### GET /goals/{goalId}/stats
Get detailed goal statistics.
```json
{
  "goalId": "uuid",
  "totalDays": 60,
  "daysElapsed": 30,
  "checkInsCount": 25,
  "currentStreak": 5,
  "longestStreak": 12,
  "completionRate": 83.3,
  "weeklyStats": [
    { "week": 1, "checkIns": 6, "target": 7 },
    { "week": 2, "checkIns": 7, "target": 7 }
  ],
  "monthlyProgress": [
    { "month": "January", "checkIns": 28, "target": 31 }
  ]
}
```

## Check-ins Endpoints

### GET /check-ins
Get check-ins feed (user + friends).
**Query Parameters**:
- `goalId`: Filter by specific goal
- `userId`: Filter by specific user
- `date`: Filter by specific date (YYYY-MM-DD)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

### POST /check-ins
Create a new check-in.
**Content-Type**: `multipart/form-data`
```
goalId: uuid
caption: "Crushed today's workout!"
image: [file]
locationLat: 40.7128 (optional)
locationLng: -74.0060 (optional)
locationName: "Central Park Gym" (optional)
```

### GET /check-ins/{checkInId}
Get specific check-in details.

### PUT /check-ins/{checkInId}
Update check-in caption.

### DELETE /check-ins/{checkInId}
Delete a check-in.

### POST /check-ins/{checkInId}/like
Like a check-in.

### DELETE /check-ins/{checkInId}/like
Unlike a check-in.

### GET /check-ins/{checkInId}/comments
Get comments for a check-in.

### POST /check-ins/{checkInId}/comments
Add comment to check-in.
```json
{
  "content": "Great job! Keep it up! 🔥"
}
```

## Groups Endpoints

### GET /groups
Get user's groups.

### POST /groups
Create a new group.
```json
{
  "name": "Fitness Accountability Squad",
  "description": "Daily workout accountability group",
  "isPrivate": false,
  "maxMembers": 10
}
```

### GET /groups/{groupId}
Get group details.

### PUT /groups/{groupId}
Update group (admin only).

### DELETE /groups/{groupId}
Delete group (admin only).

### GET /groups/{groupId}/members
Get group members.

### POST /groups/{groupId}/join
Join a group.

### POST /groups/{groupId}/leave
Leave a group.

### POST /groups/{groupId}/invite
Invite user to group.
```json
{
  "userId": "uuid"
}
```

### GET /groups/{groupId}/feed
Get group-specific check-ins feed.

## Social Endpoints

### GET /social/feed
Get personalized feed of check-ins from followed users.

### GET /social/followers
Get current user's followers.

### GET /social/following
Get users current user is following.

### POST /social/follow
Follow a user.
```json
{
  "userId": "uuid"
}
```

### DELETE /social/follow/{userId}
Unfollow a user.

### GET /social/friend-requests
Get pending friend requests.

### POST /social/friend-requests/{requestId}/accept
Accept friend request.

### POST /social/friend-requests/{requestId}/decline
Decline friend request.

## Progress Replays Endpoints

### GET /replays
Get user's progress replays.

### POST /replays
Generate a new replay for completed goal.
```json
{
  "goalId": "uuid",
  "title": "My 30-Day Fitness Journey",
  "isPremium": false
}
```

### GET /replays/{replayId}
Get replay details and video URL.

### POST /replays/{replayId}/share
Share replay to social media.
```json
{
  "platform": "instagram", // instagram, tiktok, twitter
  "caption": "Check out my progress!"
}
```

## Notifications Endpoints

### GET /notifications
Get user notifications.
**Query Parameters**:
- `unread`: `true` to get only unread notifications
- `type`: Filter by notification type
- `limit`: Number of results (default: 50)

### PUT /notifications/{notificationId}/read
Mark notification as read.

### PUT /notifications/read-all
Mark all notifications as read.

### POST /notifications/settings
Update notification preferences.
```json
{
  "pushNotifications": true,
  "emailNotifications": false,
  "checkInReminders": true,
  "socialInteractions": true,
  "groupUpdates": true
}
```

## File Upload Endpoints

### POST /upload/image
Upload and process image.
**Content-Type**: `multipart/form-data`
**Response**:
```json
{
  "url": "https://cdn.commitapp.com/images/uuid.jpg",
  "thumbnailUrl": "https://cdn.commitapp.com/images/uuid_thumb.jpg",
  "width": 1080,
  "height": 1920,
  "fileSize": 245760
}
```

## Analytics Endpoints (Internal)

### GET /analytics/goals
Get goal completion analytics.

### GET /analytics/engagement
Get user engagement metrics.

### GET /analytics/retention
Get user retention data.

## Error Responses

All endpoints return consistent error responses:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting
- **General API**: 1000 requests per hour per user
- **File Uploads**: 50 uploads per hour per user
- **Authentication**: 10 attempts per minute per IP

## Webhooks (Future)
For integrating with external services:
- Goal completion events
- User milestone achievements
- Payment processing events
