import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { goalsAPI } from '../../services/api';

interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    categoryId: number;
    startDate: string;
    endDate: string;
    targetFrequency: number;
    isPublic: boolean;
    status: 'active' | 'completed' | 'paused';
    currentStreak: number;
    longestStreak: number;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
        icon: string;
        color: string;
        description: string;
    };
}

interface GoalsState {
    goals: Goal[];
    publicGoals: Goal[];
    categories: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: GoalsState = {
    goals: [],
    publicGoals: [],
    categories: [],
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchGoals = createAsyncThunk(
    'goals/fetchGoals',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await goalsAPI.getGoals(state.auth.token);
        return response.data.goals;
    }
);

export const fetchCategories = createAsyncThunk(
    'goals/fetchCategories',
    async () => {
        const response = await goalsAPI.getCategories();
        return response.data.categories;
    }
);

export const createGoal = createAsyncThunk(
    'goals/createGoal',
    async (goalData: {
        title: string;
        description: string;
        categoryId: string;
        targetDays: number;
        isPublic: boolean;
    }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await goalsAPI.createGoal(goalData, state.auth.token);
        return response.data;
    }
);

export const fetchPublicGoals = createAsyncThunk(
    'goals/fetchPublicGoals',
    async (category?: string) => {
        const response = await goalsAPI.getPublicGoals(category);
        return response.data.goals;
    }
);

const goalsSlice = createSlice({
    name: 'goals',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch goals
            .addCase(fetchGoals.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.isLoading = false;
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch goals';
            })
            // Fetch categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Create goal
            .addCase(createGoal.fulfilled, (state, action) => {
                state.goals.push(action.payload);
            })
            // Fetch public goals
            .addCase(fetchPublicGoals.fulfilled, (state, action) => {
                state.publicGoals = action.payload;
            });
    },
});

export const { clearError } = goalsSlice.actions;
export default goalsSlice.reducer;
