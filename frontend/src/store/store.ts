import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chamberReducer from './slices/chamberSlice'

export const store = configureStore({
    reducer : {
        auth : authReducer,
        chamber: chamberReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch