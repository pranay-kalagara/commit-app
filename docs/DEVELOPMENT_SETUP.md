# Commit App - Development Setup Guide

## Prerequisites

### 1. Node.js Version Management
```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use the specified Node.js version
nvm use 18.19.0
nvm install 18.19.0  # if not already installed
```

### 2. Database Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install Redis (macOS)
brew install redis
brew services start redis
```

## Project Structure (Production-Ready)

```
commit-app/
├── .nvmrc                    # Node.js version specification
├── docker-compose.yml        # Local development services
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
├── backend/                 # Node.js API server
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts           # Express app setup
│   │   ├── server.ts        # Server entry point
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── tests/               # Unit and integration tests
│   └── migrations/          # Database migrations
├── mobile/                  # React Native app
│   ├── package.json
│   ├── app.json
│   ├── src/
│   └── __tests__/
├── web-admin/              # Optional web admin panel
│   ├── package.json
│   └── src/
└── infrastructure/         # Deployment configs
    ├── docker/
    ├── kubernetes/
    └── terraform/
```

## Environment Management Best Practices

### 1. **Dependency Isolation**
- **package.json + package-lock.json**: Lock exact dependency versions
- **Docker containers**: Complete environment isolation
- **Separate environments**: dev, staging, production

### 2. **Environment Variables**
```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/commit_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key
AWS_ACCESS_KEY_ID=dev_key
AWS_SECRET_ACCESS_KEY=dev_secret

# .env.production
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://prod-db:5432/commit_prod
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=super_secure_production_secret
AWS_ACCESS_KEY_ID=prod_key
AWS_SECRET_ACCESS_KEY=prod_secret
```

### 3. **Docker for Consistency**
```dockerfile
# backend/Dockerfile
FROM node:18.19.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## Why This Approach vs Python venv?

### Node.js Advantages:
1. **npm/yarn**: Built-in dependency management
2. **package-lock.json**: Exact version locking
3. **Docker**: Complete environment isolation
4. **nvm**: Node version management
5. **Monorepo support**: Manage backend + frontend together

### Production Deployment:
1. **Containerization**: Docker ensures identical environments
2. **CI/CD**: Automated testing and deployment
3. **Scaling**: Kubernetes for auto-scaling
4. **Monitoring**: Built-in APM and logging

## Development Workflow

### 1. **Local Development**
```bash
# Start all services
docker-compose up -d postgres redis

# Install dependencies
cd backend && npm install
cd ../mobile && npm install

# Run in development mode
npm run dev  # Backend with hot reload
npm run start  # Mobile with Expo
```

### 2. **Testing**
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

### 3. **Production Build**
```bash
npm run build         # TypeScript compilation
npm run start         # Production server
```

## Security & Best Practices

### 1. **Secrets Management**
- **Never commit secrets** to version control
- **Use environment variables** for all config
- **Rotate secrets regularly** in production
- **Use AWS Secrets Manager** or similar for production

### 2. **Code Quality**
- **ESLint + Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Jest**: Comprehensive testing
- **TypeScript**: Type safety

### 3. **Performance**
- **Redis caching**: Fast data access
- **Database indexing**: Optimized queries
- **CDN**: Static asset delivery
- **Load balancing**: Handle traffic spikes

This approach gives you:
✅ **Professional development setup**
✅ **Production-ready architecture**
✅ **Scalable infrastructure**
✅ **Team collaboration support**
✅ **DevOps best practices**
