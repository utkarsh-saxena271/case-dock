import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Document {
    id: string
    customName: string
    fileUrl: string
    fileId: string
    caseId: string | null
    hearingId: string | null
}

interface Case {
    id: string,
    name: string,
    description: string,
    status: 'ACTIVE' | 'ON_HOLD' | 'CLOSED',
    ownerType: 'PERSONAL' | "CHAMBER",
    personalOwnerId?: string,
    chamberId?: string
    documents: Document[] | null
}

interface Hearing {
    id: string
    date: string
    notes: string | null
    documents: Document[]
}

interface CaseDetail extends Case {
    hearings: Hearing[]
}

interface CaseState {
    myCases: Case[]
    currentCase: CaseDetail | null
    chamberCases: Case[]
}

const initialState: CaseState = {
    myCases: [],
    currentCase: null,
    chamberCases: []
}


const caseSlice = createSlice({
    name: "case",
    initialState,
    reducers: {
        loadMyCases: (state, action: PayloadAction<Case[]>) => {
            state.myCases = action.payload
        },
        setCurrentCase: (state, action: PayloadAction<CaseDetail>) => {
            state.currentCase = action.payload
        },
        addCase: (state, action: PayloadAction<Case>) => {
            state.myCases.push(action.payload)
        },
        updateCaseInStore: (state, action: PayloadAction<Case>) => {
            state.myCases = state.myCases.map(c =>
                c.id === action.payload.id ? action.payload : c
            )
            if (state.currentCase?.id === action.payload.id) {
                state.currentCase = { ...state.currentCase, ...action.payload }
            }
        },
        removeCase: (state, action: PayloadAction<string>) => {
            state.myCases = state.myCases.filter(c => c.id !== action.payload)
        },
        loadChamberCases: (state, action: PayloadAction<Case[]>) => {
            state.chamberCases = action.payload
        }
    }
})

export const {
    loadMyCases, setCurrentCase, addCase, updateCaseInStore, removeCase, loadChamberCases
} = caseSlice.actions;

export default caseSlice.reducer