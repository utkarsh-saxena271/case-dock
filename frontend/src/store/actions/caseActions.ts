import instance from "../../api/axiosConfig"
import { loadMyCases, setCurrentCase, addCase, updateCaseInStore, removeCase, loadChamberCases } from "../slices/caseSlice"
import type { AppDispatch, RootState } from "../store"

interface CreateCasePayload {
    name: string
    description?: string
    ownerType: 'PERSONAL' | 'CHAMBER'
    chamberId?: string
}

interface UpdateCasePayload {
    caseId: string
    name?: string
    description?: string
    status?: 'ACTIVE' | 'ON_HOLD' | 'CLOSED'
}

export const fetchMyCases = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get('/cases', {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadMyCases(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const createCase = (data: CreateCasePayload) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.post('/cases', data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(addCase(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const fetchCaseById = (caseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get(`/cases/${caseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(setCurrentCase(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const updateCase = (data: UpdateCasePayload) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const { caseId, ...body } = data
        const res = await instance.patch(`/cases/${caseId}`, body, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(updateCaseInStore(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const deleteCase = (caseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        await instance.delete(`/cases/${caseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(removeCase(caseId))
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const fetchChamberCases = (chamberId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get(`/chamber/${chamberId}/cases`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadChamberCases(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}