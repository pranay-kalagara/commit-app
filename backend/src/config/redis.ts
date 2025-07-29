import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis;

export const connectRedis = async (): Promise<void> => {
    try {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        };

        redis = new Redis(redisConfig);

        // Test the connection
        await redis.ping();

        redis.on('connect', () => {
            logger.info('Redis connection established');
        });

        redis.on('error', (error) => {
            logger.error('Redis connection error:', error);
        });

        redis.on('close', () => {
            logger.warn('Redis connection closed');
        });

        logger.info('Redis client initialized successfully');
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
};

export const getRedis = (): Redis => {
    if (!redis) {
        throw new Error('Redis not initialized. Call connectRedis() first.');
    }
    return redis;
};

// Cache utilities
export const cache = {
    async get(key: string): Promise<string | null> {
        try {
            return await redis.get(key);
        } catch (error) {
            logger.error('Redis GET error:', { key, error });
            return null;
        }
    },

    async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
        try {
            if (ttlSeconds) {
                await redis.setex(key, ttlSeconds, value);
            } else {
                await redis.set(key, value);
            }
            return true;
        } catch (error) {
            logger.error('Redis SET error:', { key, error });
            return false;
        }
    },

    async del(key: string): Promise<boolean> {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            logger.error('Redis DEL error:', { key, error });
            return false;
        }
    },

    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Redis EXISTS error:', { key, error });
            return false;
        }
    },

    async hget(key: string, field: string): Promise<string | null> {
        try {
            return await redis.hget(key, field);
        } catch (error) {
            logger.error('Redis HGET error:', { key, field, error });
            return null;
        }
    },

    async hset(key: string, field: string, value: string): Promise<boolean> {
        try {
            await redis.hset(key, field, value);
            return true;
        } catch (error) {
            logger.error('Redis HSET error:', { key, field, error });
            return false;
        }
    },

    async expire(key: string, ttlSeconds: number): Promise<boolean> {
        try {
            await redis.expire(key, ttlSeconds);
            return true;
        } catch (error) {
            logger.error('Redis EXPIRE error:', { key, ttlSeconds, error });
            return false;
        }
    },
};

export const closeRedis = async (): Promise<void> => {
    if (redis) {
        await redis.quit();
        logger.info('Redis connection closed');
    }
};
