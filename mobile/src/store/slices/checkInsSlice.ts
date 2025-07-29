import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkInsAPI } from '../../services/api';

interface CheckIn {
    id: string;
    goalId: string;
    userId: string;
    checkInDate: string;
    description: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    goal: {
        title: string;
        category: {
            name: string;
            icon: string;
        };
    };
}

interface CheckInsState {
    checkIns: CheckIn[];
    publicCheckIns: CheckIn[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CheckInsState = {
    checkIns: [],
    publicCheckIns: [],
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchCheckIns = createAsyncThunk(
    'checkIns/fetchCheckIns',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await checkInsAPI.getCheckIns(state.auth.token);
        return response.data.checkIns;
    }
);

export const createCheckIn = createAsyncThunk(
    'checkIns/createCheckIn',
    async (checkInData: {
        goalId: string;
        description: string;
        imageUrl?: string;
    }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await checkInsAPI.createCheckIn(checkInData, state.auth.token);
        return response.data;
    }
);

export const fetchPublicCheckIns = createAsyncThunk(
    'checkIns/fetchPublicCheckIns',
    async (category?: string) => {
        const response = await checkInsAPI.getPublicCheckIns(category);
        return response.data.checkIns;
    }
);

const checkInsSlice = createSlice({
    name: 'checkIns',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch check-ins
            .addCase(fetchCheckIns.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCheckIns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.checkIns = action.payload;
            })
            .addCase(fetchCheckIns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch check-ins';
            })
            // Create check-in
            .addCase(createCheckIn.fulfilled, (state, action) => {
                state.checkIns.unshift(action.payload);
            })
            // Fetch public check-ins
            .addCase(fetchPublicCheckIns.fulfilled, (state, action) => {
                state.publicCheckIns = action.payload;
            });
    },
});

export const { clearError } = checkInsSlice.actions;
export default checkInsSlice.reducer;
