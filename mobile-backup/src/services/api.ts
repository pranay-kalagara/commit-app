import axios from 'axios';

// Use environment variable or default to localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    // Token will be added per request in the API functions
    return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - could dispatch logout action
            console.log('Unauthorized request');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        apiClient.post('/auth/login', { email, password }),
    
    register: (userData: {
        email: string;
        password: string;
        username: string;
        firstName: string;
        lastName: string;
    }) =>
        apiClient.post('/auth/register', userData),
    
    logout: (token: string) =>
        apiClient.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getProfile: (token: string) =>
        apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    updateProfile: (userData: any, token: string) =>
        apiClient.put('/users/me', userData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
};

// Goals API
export const goalsAPI = {
    getCategories: () =>
        apiClient.get('/goals/categories'),
    
    getGoals: (token: string) =>
        apiClient.get('/goals', {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    createGoal: (goalData: {
        title: string;
        description: string;
        categoryId: string;
        targetDays: number;
        isPublic: boolean;
    }, token: string) =>
        apiClient.post('/goals', goalData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getGoal: (goalId: string, token: string) =>
        apiClient.get(`/goals/${goalId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    updateGoal: (goalId: string, goalData: any, token: string) =>
        apiClient.put(`/goals/${goalId}`, goalData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    deleteGoal: (goalId: string, token: string) =>
        apiClient.delete(`/goals/${goalId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getPublicGoals: (category?: string) =>
        apiClient.get('/goals/public', {
            params: category ? { category } : {}
        }),
    
    getGoalStats: (goalId: string, token: string) =>
        apiClient.get(`/goals/${goalId}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
};

// Check-ins API
export const checkInsAPI = {
    getCheckIns: (token: string) =>
        apiClient.get('/check-ins', {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    createCheckIn: (checkInData: {
        goalId: string;
        description: string;
        imageUrl?: string;
    }, token: string) =>
        apiClient.post('/check-ins', checkInData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getCheckIn: (checkInId: string, token: string) =>
        apiClient.get(`/check-ins/${checkInId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    updateCheckIn: (checkInId: string, checkInData: any, token: string) =>
        apiClient.put(`/check-ins/${checkInId}`, checkInData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    deleteCheckIn: (checkInId: string, token: string) =>
        apiClient.delete(`/check-ins/${checkInId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getPublicCheckIns: (category?: string) =>
        apiClient.get('/check-ins/public', {
            params: category ? { category } : {}
        }),
};

// Groups API (for Phase 2)
export const groupsAPI = {
    getUserGroups: (token: string) =>
        apiClient.get('/groups', {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getPublicGroups: () =>
        apiClient.get('/groups/public'),
    
    createGroup: (groupData: {
        name: string;
        description: string;
        isPrivate: boolean;
        maxMembers: number;
    }, token: string) =>
        apiClient.post('/groups', groupData, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getGroup: (groupId: string, token: string) =>
        apiClient.get(`/groups/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    joinGroup: (groupId: string, token: string) =>
        apiClient.post(`/groups/${groupId}/join`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    leaveGroup: (groupId: string, token: string) =>
        apiClient.post(`/groups/${groupId}/leave`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }),
    
    getGroupMembers: (groupId: string, token: string) =>
        apiClient.get(`/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
};

export default apiClient;
