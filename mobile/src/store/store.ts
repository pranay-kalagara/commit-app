import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import goalsSlice from './slices/goalsSlice';
import checkInsSlice from './slices/checkInsSlice';
import groupsSlice from './slices/groupsSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        goals: goalsSlice,
        checkIns: checkInsSlice,
        groups: groupsSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
