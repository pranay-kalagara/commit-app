# Commit Mobile App

React Native mobile application for the Commit social accountability platform.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Goals Management**: Create, view, and track personal goals
- **Daily Check-ins**: Photo/video proof uploads with descriptions
- **Group Accountability**: Join groups for social pressure and support
- **Progress Tracking**: Streaks, statistics, and achievements
- **Social Feed**: View public goals and check-ins from the community

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Expo Camera/ImagePicker** for photo capture
- **Axios** for API communication

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Expo CLI (optional, for local development)

### Using Docker (Recommended)

1. **Start all services including mobile app:**
   ```bash
   docker compose up mobile
   ```

2. **Access the services:**
   - **Backend API**: http://localhost:3000
   - **Mobile Web**: Check Docker port mapping (e.g., http://localhost:49684)
   - **Database**: localhost:5433
   - **Redis**: localhost:6379

3. **Check service status:**
   ```bash
   docker compose ps
   ```

## 📱 Mobile App

### Current Status
✅ **Working Features:**
- Container builds and runs successfully
- Mobile development via Expo Go (QR code)
- Navigation with vector icons
- Redux store configuration
- API integration setup

⚠️ **Known Issues:**
- **Web Interface**: Shows Expo manifest instead of React app due to CRC compilation error
- **CRC Error**: `Crc error - -1924203575 - 2013042745` prevents web bundle compilation
- **Root Cause**: Cache corruption in Metro bundler or React Native Web compatibility

### Mobile Development

1. **Expo Go (Mobile Testing):**
   ```bash
   # Container should be running
   docker compose ps
   # Scan QR code from container logs with Expo Go app
   docker logs commit-mobile
   ```

2. **Local Development:**
   ```bash
   cd mobile
   npm install
   npm start  # Expo development server
   ```

### Web Development (Troubleshooting)

The web interface currently serves manifest JSON instead of the React app. **Attempted solutions:**
- Cache clearing (`expo start --clear`)
- React temp file cleanup
- TypeScript configuration fixes
- Docker volume rebuilds

**Next steps to resolve:**
- Investigate React Native Web compatibility
- Test with different Expo SDK version
- Check webpack configuration
- Consider switching to Expo Router

## 🔧 Backend API

### Available Endpoints

**Authentication** (`/api/v1/auth`):
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - User logout (protected)
- `GET /me` - Get current user (protected)

**Users** (`/api/v1/users`) - Protected:
- User profile management
- Follow/unfollow functionality

**Goals** (`/api/v1/goals`) - Protected:
- Create, read, update, delete goals
- Goal progress tracking

**Check-ins** (`/api/v1/check-ins`) - Protected:
- Daily check-ins with photos
- Progress updates

**Groups** (`/api/v1/groups`) - Protected:
- Create and join accountability groups
- Group member management

**Social** (`/api/v1/social`) - Protected:
- Social features and interactions

### Testing the Backend

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **User Registration:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

3. **User Login:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

4. **Create Goal (requires auth token):**
   ```bash
   curl -X POST http://localhost:3000/api/v1/goals \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "title": "Exercise Daily",
       "description": "Go for a 30-minute walk every day",
       "category": "fitness",
       "targetDays": 30
     }'
   ```

## 🗄️ Database

### Schema Overview
- **Users**: Authentication and profiles
- **Goals**: User goals with categories and targets
- **CheckIns**: Daily progress updates with photos
- **Groups**: Accountability groups
- **Follows**: User following relationships

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it commit-postgres psql -U postgres -d commit_db

# View tables
\dt

# Example queries
SELECT * FROM "User" LIMIT 5;
SELECT * FROM "Goal" LIMIT 5;
```

## 🔧 Development

### Environment Variables

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@postgres:5432/commit_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Local Development

1. **Backend only:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Mobile only:**
   ```bash
   cd mobile
   npm install
   npm start
   ```

### Docker Development

```bash
# Rebuild specific service
docker compose build mobile
docker compose up mobile -d

# View logs
docker logs commit-mobile -f
docker logs commit-backend -f

# Shell access
docker exec -it commit-mobile sh
docker exec -it commit-backend sh
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :3000  # Backend
   lsof -i :5433  # Database
   lsof -i :19006 # Expo DevTools
   ```

2. **Database Connection:**
   ```bash
   # Reset database
   docker compose down
   docker volume rm commit-app_postgres_data
   docker compose up -d
   ```

3. **Mobile Cache Issues:**
   ```bash
   # Clear Expo cache
   docker exec commit-mobile sh -c "cd /opt/react_native_app && rm -rf .expo && npm start -- --clear"
   ```

4. **CRC Error (Web):**
   - Currently unresolved - web interface shows manifest instead of app
   - Mobile development via Expo Go works fine
   - Backend API fully functional

### Logs and Debugging

```bash
# Service logs
docker compose logs mobile
docker compose logs backend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f mobile
```

## 📋 Project Status

### ✅ Completed
- Docker containerization
- Backend API with full CRUD operations
- Database schema and migrations
- Mobile app navigation and screens
- Redux state management
- Authentication system
- File upload handling
- Rate limiting and security

### 🔄 In Progress
- Web interface compilation (CRC error)
- Mobile UI polish
- Image upload for check-ins
- Push notifications

### 📝 TODO
- Web interface fix
- Production deployment
- Testing suite
- Documentation completion
- Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## Building for Production

1. **Build for iOS:**
   ```bash
   npm run build:ios
   ```

2. **Build for Android:**
   ```bash
   npm run build:android
   ```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run type-check
```
