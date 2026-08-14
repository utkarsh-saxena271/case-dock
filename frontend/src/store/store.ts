import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chamberReducer from './slices/chamberSlice'
import membershipReducer from './slices/membershipSlice'
import caseReducer from './slices/caseSlice'
import hearingReducer from './slices/hearingSlice'
import documentReducer from './slices/documentSlice'

export const store = configureStore({
    reducer : {
        auth : authReducer,
        chamber: chamberReducer,
        membership: membershipReducer,
        cases: caseReducer,
        hearing: hearingReducer,
        document: documentReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch