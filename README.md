# Commit App - Social Accountability Platform

A social accountability app that combines elements of BeReal, Strava, and TikTok to help users achieve their goals through daily check-ins, group challenges, and AI-generated progress replays.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Make (optional, for convenience commands)

### Development Setup

1. **Clone and navigate to the project:**
   ```bash
   cd commit-app
   ```

2. **Start the development environment:**
   ```bash
   make up
   # or manually:
   # docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

3. **Check if everything is running:**
   ```bash
   make health
   # or manually:
   # curl http://localhost:3000/health
   ```

### 🔗 Service URLs

- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Flutter Mobile Web**: Auto-assigned port (check `docker compose ps`)
- **Database Admin (pgAdmin)**: http://localhost:8080
  - Email: `admin@commitapp.com`
  - Password: `admin123`
- **Redis Admin**: http://localhost:8082

### 📱 API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile

#### Goals (Coming Soon)
- `GET /api/v1/goals` - Get user goals
- `POST /api/v1/goals` - Create new goal
- `GET /api/v1/goals/:id` - Get specific goal

#### Check-ins (Coming Soon)
- `GET /api/v1/check-ins` - Get check-ins feed
- `POST /api/v1/check-ins` - Create new check-in

## 🛠 Development Commands

```bash
# Start services
make up

# View logs
make logs
make logs-api
make logs-db
make logs-mobile

# Mobile development
make mobile

# Stop services
make down

# Rebuild images
make build

# Clean everything
make clean

# Run tests
make test

# Open shells
make shell-api
make shell-db
```

## 🏗 Architecture

### Backend (Node.js + TypeScript)
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **Docker** - Containerization

### Frontend (React Native - Coming Soon)
- **Expo** - Development platform
- **React Navigation** - Navigation
- **Redux Toolkit** - State management
- **Axios** - API client

## 📊 Database Schema

The app uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `goals` - User goals and challenges
- `goal_categories` - Goal categories (Fitness, Learning, etc.)
- `check_ins` - Daily progress check-ins
- `groups` - Accountability groups
- `group_members` - Group memberships

## 🔐 Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
# Database
DATABASE_URL=postgresql://commit_user:commit_password@postgres:5432/commit_dev

# Redis
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# External APIs (for production)
AWS_ACCESS_KEY_ID=your_aws_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
docker compose exec backend npm run test:auth
docker compose exec backend npm run test:goals
```

## 📦 Deployment

### Production Build
```bash
# Build production images
docker compose -f docker-compose.yml build

# Start production services
docker compose -f docker-compose.yml up -d
```

### Environment-specific Configs
- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production overrides (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## 📝 API Documentation

Once running, visit http://localhost:3000/api-docs for interactive API documentation.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 5432, 6379, 8080, 8081 are available
2. **Docker issues**: Try `make clean` and `make build`
3. **Database connection**: Check if PostgreSQL container is healthy with `docker compose ps`

### Logs
```bash
# View all logs
make logs

# View specific service logs
make logs-api
make logs-db
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical decisions
- **[API Specification](./docs/API_SPECIFICATION.md)** - Complete REST API documentation
- **[Development Setup](./docs/DEVELOPMENT_SETUP.md)** - Development environment setup
- **[Frontend Structure](./docs/FRONTEND_STRUCTURE.md)** - React Native app structure
- **[MVP Roadmap](./docs/MVP_ROADMAP.md)** - Product roadmap and features

## 🎯 Current Status

### ✅ Completed
- [x] Backend API foundation with full CRUD operations
- [x] Authentication system (JWT, refresh tokens)
- [x] Docker containerization and development environment
- [x] Database schema and migrations (PostgreSQL + Prisma)
- [x] Redis caching and session management
- [x] React Native mobile app structure
- [x] Navigation and UI components
- [x] Redux state management
- [x] Rate limiting and security middleware

### 🔄 In Progress
- [ ] Web interface compilation (CRC error resolution)
- [ ] Mobile UI polish and testing
- [ ] Image upload for check-ins
- [ ] Push notifications

### 📝 TODO
- [ ] Social features (groups, following)
- [ ] AI-generated progress replays
- [ ] Production deployment
- [ ] Testing suite
- [ ] Performance optimization
