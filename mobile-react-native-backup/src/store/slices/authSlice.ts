import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    timezone: string;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }) => {
        const response = await authAPI.login(email, password);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: {
        email: string;
        password: string;
        username: string;
        firstName: string;
        lastName: string;
    }) => {
        const response = await authAPI.register(userData);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    }
);

export const loadStoredAuth = createAsyncThunk(
    'auth/loadStored',
    async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            const response = await authAPI.getProfile(token);
            return { user: response.data, token };
        }
        throw new Error('No stored token');
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { getState }) => {
        const state = getState() as { auth: AuthState };
        if (state.auth.token) {
            await authAPI.logout(state.auth.token);
        }
        await AsyncStorage.removeItem('token');
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Login failed';
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Registration failed';
            })
            // Load stored auth
            .addCase(loadStoredAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadStoredAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loadStoredAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
