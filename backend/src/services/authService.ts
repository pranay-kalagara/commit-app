import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { ApiError } from '../middleware/errorHandler';
import { User, CreateUserRequest, LoginRequest, AuthResponse, UserProfile } from '../types/User';
import { logger } from '../utils/logger';

export class AuthService {
    private static readonly SALT_ROUNDS = 12;
    private static readonly TOKEN_EXPIRY = '7d';
    private static readonly REFRESH_TOKEN_EXPIRY = '30d';

    static async register(userData: CreateUserRequest): Promise<AuthResponse> {
        const { email, username, password, firstName, lastName } = userData;

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            throw new ApiError('User with this email or username already exists', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);

        // Create user
        const userId = uuidv4();
        const result = await query(
            `INSERT INTO users (
                id, email, username, password_hash, first_name, last_name,
                timezone, created_at, updated_at, last_active_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
            RETURNING id, email, username, first_name, last_name, profile_image_url,
                     bio, timezone, created_at, last_active_at, email_verified, push_notifications_enabled`,
            [userId, email, username, passwordHash, firstName, lastName, 'UTC']
        );

        const user = result.rows[0];
        const userProfile = AuthService.mapToUserProfile(user);

        // Generate tokens
        const token = AuthService.generateAccessToken(user);
        const refreshToken = AuthService.generateRefreshToken(user);

        // Store refresh token in Redis
        await cache.set(`refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

        logger.info('User registered successfully', { userId: user.id, email });

        return {
            user: userProfile,
            token,
            refreshToken,
        };
    }

    static async login(loginData: LoginRequest): Promise<AuthResponse> {
        const { email, password } = loginData;

        // Find user by email
        const result = await query(
            `SELECT id, email, username, password_hash, first_name, last_name,
                    profile_image_url, bio, timezone, created_at, last_active_at,
                    email_verified, push_notifications_enabled, is_active
             FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            throw new ApiError('Invalid email or password', 401);
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw new ApiError('Account has been deactivated', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new ApiError('Invalid email or password', 401);
        }

        // Update last active timestamp
        await query(
            'UPDATE users SET last_active_at = NOW() WHERE id = $1',
            [user.id]
        );

        const userProfile = AuthService.mapToUserProfile(user);

        // Generate tokens
        const token = AuthService.generateAccessToken(user);
        const refreshToken = AuthService.generateRefreshToken(user);

        // Store refresh token in Redis
        await cache.set(`refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

        logger.info('User logged in successfully', { userId: user.id, email });

        return {
            user: userProfile,
            token,
            refreshToken,
        };
    }

    static async refreshToken(refreshToken: string): Promise<{ token: string }> {
        try {
            const jwtSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new ApiError('JWT secret not configured', 500);
            }

            const decoded = jwt.verify(refreshToken, jwtSecret) as any;
            
            // Check if refresh token exists in Redis
            const storedToken = await cache.get(`refresh:${decoded.id}`);
            if (!storedToken || storedToken !== refreshToken) {
                throw new ApiError('Invalid refresh token', 401);
            }

            // Get user data
            const result = await query(
                'SELECT id, email, username, is_active FROM users WHERE id = $1',
                [decoded.id]
            );

            if (result.rows.length === 0 || !result.rows[0].is_active) {
                throw new ApiError('User not found or inactive', 401);
            }

            const user = result.rows[0];

            // Generate new access token
            const newToken = AuthService.generateAccessToken(user);

            logger.info('Token refreshed successfully', { userId: user.id });

            return { token: newToken };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Invalid refresh token', 401);
            }
            throw error;
        }
    }

    static async logout(userId: string, token: string): Promise<void> {
        // Add token to blacklist
        const tokenExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
        await cache.set(`blacklist:${token}`, 'true', tokenExpiry);

        // Remove refresh token
        await cache.del(`refresh:${userId}`);

        logger.info('User logged out successfully', { userId });
    }

    private static generateAccessToken(user: any): string {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError('JWT secret not configured', 500);
        }

        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            jwtSecret,
            { expiresIn: AuthService.TOKEN_EXPIRY }
        );
    }

    private static generateRefreshToken(user: any): string {
        const jwtSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError('JWT secret not configured', 500);
        }

        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                type: 'refresh',
            },
            jwtSecret,
            { expiresIn: AuthService.REFRESH_TOKEN_EXPIRY }
        );
    }

    private static mapToUserProfile(user: any): UserProfile {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            profileImageUrl: user.profile_image_url,
            bio: user.bio,
            timezone: user.timezone,
            createdAt: user.created_at,
            lastActiveAt: user.last_active_at,
            emailVerified: user.email_verified,
            pushNotificationsEnabled: user.push_notifications_enabled,
        };
    }
}
