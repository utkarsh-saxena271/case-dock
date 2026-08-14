import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Document {
    id: string
    customName: string
    fileUrl: string
    fileId: string
    caseId: string | null
    hearingId: string | null
}

interface DocumentState {
    caseDocuments: Document[]
    hearingDocuments: Document[]
}

const initialState: DocumentState = {
    caseDocuments: [],
    hearingDocuments: []
}

const documentSlice = createSlice({
    name: "document",
    initialState,
    reducers: {
        loadCaseDocuments: (state, action: PayloadAction<Document[]>) => {
            state.caseDocuments = action.payload
        },
        loadHearingDocuments: (state, action: PayloadAction<Document[]>) => {
            state.hearingDocuments = action.payload
        },
        addCaseDocument: (state, action: PayloadAction<Document>) => {
            state.caseDocuments.push(action.payload)
        },
        addHearingDocument: (state, action: PayloadAction<Document>) => {
            state.hearingDocuments.push(action.payload)
        },
        removeDocument: (state, action: PayloadAction<string>) => {
            state.caseDocuments = state.caseDocuments.filter(d => d.id !== action.payload)
            state.hearingDocuments = state.hearingDocuments.filter(d => d.id !== action.payload)
        }
    }
})

export const {
    loadCaseDocuments, loadHearingDocuments, addCaseDocument, addHearingDocument, removeDocument
} = documentSlice.actions
export default documentSlice.reducer