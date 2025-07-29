export interface User {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    bio?: string;
    timezone: string;
    created_at: Date;
    updated_at: Date;
    last_active_at: Date;
    is_active: boolean;
    email_verified: boolean;
    push_notifications_enabled: boolean;
}

export interface CreateUserRequest {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    bio?: string;
    timezone?: string;
    pushNotificationsEnabled?: boolean;
}

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    bio?: string;
    timezone: string;
    createdAt: Date;
    lastActiveAt: Date;
    emailVerified: boolean;
    pushNotificationsEnabled: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: UserProfile;
    token: string;
    refreshToken?: string;
}
