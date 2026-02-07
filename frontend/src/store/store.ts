import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chambersReducer from './slices/chambersSlice';
import casesReducer from './slices/casesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chambers: chambersReducer,
        cases: casesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
