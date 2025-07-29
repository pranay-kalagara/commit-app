import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError('Access token required', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            throw new ApiError('Access token required', 401);
        }

        // Check if token is blacklisted (for logout functionality)
        const isBlacklisted = await cache.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            throw new ApiError('Token has been invalidated', 401);
        }

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError('JWT secret not configured', 500);
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (!decoded.id || !decoded.email) {
            throw new ApiError('Invalid token payload', 401);
        }

        // Check if user still exists and is active (optional - can be cached)
        // For now, we trust the token payload
        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('JWT verification failed:', error.message);
            next(new ApiError('Invalid access token', 401));
        } else if (error instanceof jwt.TokenExpiredError) {
            logger.warn('JWT token expired');
            next(new ApiError('Access token expired', 401));
        } else {
            next(error);
        }
    }
};

export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without authentication
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            return next(); // Continue without authentication
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next(); // Continue without authentication
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (decoded.id && decoded.email) {
            req.user = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
            };
        }

        next();
    } catch (error) {
        // Ignore auth errors for optional auth
        next();
    }
};
