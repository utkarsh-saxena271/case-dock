import instance from "../../api/axiosConfig"
import { addChamber, loadChambers, removeChamber, setCurrentChamber, setDiscoverResults, updateChamberInStore } from "../slices/chamberSlice"
import type { AppDispatch, RootState } from "../store"

interface CreateChamberPayload {
    name:string,
    description?:string
}
interface UpdateChamberPayload {
    chamberId:string,
    name?:string,
    description?:string
}
interface DiscoverChamberPayload{
    q?: string
    page?: number
    limit?: number
}

export const fetchMyChambers = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState()
        const token = state.auth.accessToken

        const res = await instance.get('/chamber', {
            headers: { Authorization: `Bearer ${token}` }
        })

        dispatch(loadChambers(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const createChamber = (data:CreateChamberPayload) => async (dispatch:AppDispatch, getState:()=>RootState) =>{
    try {
        const state = getState()
        const token = state.auth.accessToken

        const res = await instance.post('/chamber', data, {
            headers : {Authorization : `Bearer ${token}`}
        })
        dispatch(addChamber(res.data.data.chamber))
        return res.data.data.chamber
    } catch (error) {
        if(error instanceof Error){
            console.error(error)
        }
        throw error
    }
}

export const fetchMyChamberById = (chamberId:string) => async (dispatch:AppDispatch, getState:()=>RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken

        const res = await instance.get(`/chamber/${chamberId}`,{
            headers:{Authorization: `Bearer ${token}`}
        })

        dispatch(setCurrentChamber(res.data.data))
        return res.data.data
    } catch (error) {
        if(error instanceof Error){
            console.error(error)
        }
        throw error
    }
}

export const updateChamber = (data:UpdateChamberPayload) => async (dispatch:AppDispatch, getState:()=>RootState) => {
    try {
        const state = getState()
        const token = state.auth.accessToken
        const {chamberId} = data
        const res = await instance.patch(`/chamber/${chamberId}`,{name:data.name, description:data.description},{
            headers:{Authorization:`Bearer ${token}`}
        })
        dispatch(updateChamberInStore(res.data.data))
        return res.data.data
    } catch (error) {
        if(error instanceof Error){
            console.error(error)
        }
        throw error
    }
}

export const deleteChamber = (chamberId:string) => async (dispatch:AppDispatch, getState:()=>RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken

        await instance.delete(`/chamber/${chamberId}`,{
            headers:{Authorization:`Bearer ${token}`}
        })

        dispatch(removeChamber(chamberId))
        return "chamber deleted successfully"
    } catch (error) {
        if(error instanceof Error){
            console.error(error)
        }
        throw error
    }
}


export const discoverChambers = (params:DiscoverChamberPayload) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState()
        const token = state.auth.accessToken

        const res = await instance.get('/chamber/discover', {
            headers: { Authorization: `Bearer ${token}` },
            params
        })

        dispatch(setDiscoverResults(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}