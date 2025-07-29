import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import goalRoutes from './routes/goals';
import checkInRoutes from './routes/checkIns';
import groupRoutes from './routes/groups';
import socialRoutes from './routes/social';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
});

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
    }));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
    });
});

// API routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/users`, authMiddleware, userRoutes);
app.use(`${API_PREFIX}/goals`, authMiddleware, goalRoutes);
app.use(`${API_PREFIX}/check-ins`, authMiddleware, checkInRoutes);
app.use(`${API_PREFIX}/groups`, authMiddleware, groupRoutes);
app.use(`${API_PREFIX}/social`, authMiddleware, socialRoutes);

// API documentation (development only)
if (process.env.NODE_ENV === 'development') {
    app.get('/api-docs', (req, res) => {
        res.json({
            title: 'Commit App API',
            version: '1.0.0',
            description: 'Social Accountability Platform API',
            baseUrl: `${req.protocol}://${req.get('host')}${API_PREFIX}`,
            endpoints: {
                auth: {
                    'POST /auth/register': 'Register new user',
                    'POST /auth/login': 'Login user',
                    'POST /auth/refresh': 'Refresh access token',
                    'POST /auth/logout': 'Logout user',
                },
                users: {
                    'GET /users/me': 'Get current user profile',
                    'PUT /users/me': 'Update current user profile',
                    'POST /users/me/avatar': 'Upload profile picture',
                },
                goals: {
                    'GET /goals': 'Get user goals',
                    'POST /goals': 'Create new goal',
                    'GET /goals/:id': 'Get specific goal',
                    'PUT /goals/:id': 'Update goal',
                    'DELETE /goals/:id': 'Delete goal',
                },
                checkIns: {
                    'GET /check-ins': 'Get check-ins feed',
                    'POST /check-ins': 'Create new check-in',
                    'GET /check-ins/:id': 'Get specific check-in',
                },
                groups: {
                    'GET /groups': 'Get user groups',
                    'POST /groups': 'Create new group',
                    'GET /groups/:id': 'Get group details',
                },
                social: {
                    'GET /social/feed': 'Get social feed',
                    'POST /social/follow': 'Follow user',
                    'GET /social/followers': 'Get followers',
                },
            },
        });
    });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
