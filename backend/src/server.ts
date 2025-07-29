import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { setupDatabase } from './scripts/setupDatabase';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer(): Promise<void> {
    try {
        // Connect to database
        await connectDatabase();
        logger.info('✅ Database connected successfully');

        // Setup database tables
        await setupDatabase();
        logger.info('✅ Database setup completed');

        // Connect to Redis
        await connectRedis();
        logger.info('✅ Redis connected successfully');

        // Create HTTP server
        const server = createServer(app);

        // Start listening
        server.listen(PORT, () => {
            logger.info(`🚀 Commit API Server running on port ${PORT}`);
            logger.info(`📍 Environment: ${NODE_ENV}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
            
            if (NODE_ENV === 'development') {
                logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                logger.info('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                logger.info('Process terminated');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();
