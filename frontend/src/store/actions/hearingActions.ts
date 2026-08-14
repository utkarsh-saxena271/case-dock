import instance from "../../api/axiosConfig"
import { loadHearings, addHearing, updateHearingInStore } from "../slices/hearingSlice"
import type { AppDispatch, RootState } from "../store"

interface CreateHearingPayload {
    caseId: string
    date: string
    notes?: string
}

interface UpdateHearingPayload {
    caseId: string
    hearingId: string
    date?: string
    notes?: string
}

export const fetchHearings = (caseId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const res = await instance.get(`/cases/${caseId}/hearings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadHearings(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const createHearing = (data: CreateHearingPayload) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const { caseId, ...body } = data
        const res = await instance.post(`/cases/${caseId}/hearings`, body, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(addHearing(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}

export const updateHearing = (data: UpdateHearingPayload) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const token = getState().auth.accessToken
        const { caseId, hearingId, ...body } = data
        const res = await instance.patch(`/cases/${caseId}/hearings/${hearingId}`, body, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(updateHearingInStore(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) console.error(error)
        throw error
    }
}