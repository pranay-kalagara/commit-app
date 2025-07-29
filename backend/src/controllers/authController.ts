import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !username || !password) {
        throw new ApiError('Email, username, and password are required', 400);
    }

    if (password.length < 8) {
        throw new ApiError('Password must be at least 8 characters long', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError('Invalid email format', 400);
    }

    // Username validation
    if (username.length < 3 || username.length > 30) {
        throw new ApiError('Username must be between 3 and 30 characters', 400);
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        throw new ApiError('Username can only contain letters, numbers, and underscores', 400);
    }

    const result = await AuthService.register({
        email: email.toLowerCase(),
        username,
        password,
        firstName,
        lastName,
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
    }

    const result = await AuthService.login({
        email: email.toLowerCase(),
        password,
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
    });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError('Refresh token is required', 400);
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
    });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        throw new ApiError('User not authenticated', 401);
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
        throw new ApiError('Token not found', 400);
    }

    await AuthService.logout(req.user.id, token);

    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        throw new ApiError('User not authenticated', 401);
    }

    // Get fresh user data from database
    const { query } = await import('../config/database');
    const result = await query(
        `SELECT id, email, username, first_name, last_name, profile_image_url,
                bio, timezone, created_at, last_active_at, email_verified, push_notifications_enabled
         FROM users WHERE id = $1 AND is_active = true`,
        [req.user.id]
    );

    if (result.rows.length === 0) {
        throw new ApiError('User not found', 404);
    }

    const user = result.rows[0];

    res.status(200).json({
        success: true,
        data: {
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
        },
    });
});
