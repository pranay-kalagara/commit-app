import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { groupsAPI } from '../../services/api';

interface Group {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    createdBy: string;
    isPrivate: boolean;
    maxMembers: number;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
    members?: GroupMember[];
}

interface GroupMember {
    id: string;
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
    user: {
        username: string;
        firstName?: string;
        lastName?: string;
    };
}

interface GroupsState {
    groups: Group[];
    publicGroups: Group[];
    currentGroup: Group | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: GroupsState = {
    groups: [],
    publicGroups: [],
    currentGroup: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchUserGroups = createAsyncThunk(
    'groups/fetchUserGroups',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await groupsAPI.getUserGroups(state.auth.token);
        return response.data.groups;
    }
);

export const fetchPublicGroups = createAsyncThunk(
    'groups/fetchPublicGroups',
    async () => {
        const response = await groupsAPI.getPublicGroups();
        return response.data.groups;
    }
);

export const createGroup = createAsyncThunk(
    'groups/createGroup',
    async (groupData: {
        name: string;
        description: string;
        isPrivate: boolean;
        maxMembers: number;
    }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await groupsAPI.createGroup(groupData, state.auth.token);
        return response.data;
    }
);

export const joinGroup = createAsyncThunk(
    'groups/joinGroup',
    async (groupId: string, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const response = await groupsAPI.joinGroup(groupId, state.auth.token);
        return response.data;
    }
);

export const leaveGroup = createAsyncThunk(
    'groups/leaveGroup',
    async (groupId: string, { getState }) => {
        const state = getState() as { auth: { token: string } };
        await groupsAPI.leaveGroup(groupId, state.auth.token);
        return groupId;
    }
);

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentGroup: (state, action) => {
            state.currentGroup = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch user groups
            .addCase(fetchUserGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groups = action.payload;
            })
            .addCase(fetchUserGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch groups';
            })
            // Fetch public groups
            .addCase(fetchPublicGroups.fulfilled, (state, action) => {
                state.publicGroups = action.payload;
            })
            // Create group
            .addCase(createGroup.fulfilled, (state, action) => {
                state.groups.push(action.payload);
            })
            // Join group
            .addCase(joinGroup.fulfilled, (state, action) => {
                state.groups.push(action.payload);
            })
            // Leave group
            .addCase(leaveGroup.fulfilled, (state, action) => {
                state.groups = state.groups.filter(group => group.id !== action.payload);
            });
    },
});

export const { clearError, setCurrentGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
