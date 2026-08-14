import instance from "../../api/axiosConfig"
import { loadCaseDocuments, loadHearingDocuments, addCaseDocument, addHearingDocument, removeDocument } from "../slices/documentSlice"
import type { AppDispatch, RootState } from "../store"

export const fetchCaseDocuments = (caseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get(`/cases/${caseId}/documents`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadCaseDocuments(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const fetchHearingDocuments = (caseId: string, hearingId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get(`/cases/${caseId}/hearings/${hearingId}/documents`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadHearingDocuments(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const uploadCaseDocument = (caseId: string, file: File, customName?: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        try {
            const token = getState().auth.accessToken
            const formData = new FormData()
            formData.append('file', file)
            if (customName) formData.append('customName', customName)

            const res = await instance.post(`/cases/${caseId}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            dispatch(addCaseDocument(res.data.data))
            return res.data.data
        } catch (error) {
            if (error instanceof Error) console.error(error)
            throw error
        }
    }

export const uploadHearingDocument = (caseId: string, hearingId: string, file: File, customName?: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        try {
            const token = getState().auth.accessToken
            const formData = new FormData()
            formData.append('file', file)
            if (customName) formData.append('customName', customName)

            const res = await instance.post(`/cases/${caseId}/hearings/${hearingId}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            dispatch(addHearingDocument(res.data.data))
            return res.data.data
        } catch (error) {
            if (error instanceof Error) console.error(error)
            throw error
        }
    }

export const deleteDocument = (caseId: string, documentId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        await instance.delete(`/cases/${caseId}/documents/${documentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(removeDocument(documentId))
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}