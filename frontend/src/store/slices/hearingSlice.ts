import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Hearing {
    id: string
    date: string
    notes: string | null
    caseId: string
}

interface HearingState {
    hearings: Hearing[]
}

const initialState: HearingState = {
    hearings: []
}

const hearingSlice = createSlice({
    name: "hearing",
    initialState,
    reducers: {
        loadHearings: (state, action: PayloadAction<Hearing[]>) => {
            state.hearings = action.payload
        },
        addHearing: (state, action: PayloadAction<Hearing>) => {
            state.hearings.push(action.payload)
        },
        updateHearingInStore: (state, action: PayloadAction<Hearing>) => {
            state.hearings = state.hearings.map(h =>
                h.id === action.payload.id ? action.payload : h
            )
        }
    }
})

export const { loadHearings, addHearing, updateHearingInStore } = hearingSlice.actions
export default hearingSlice.reducer