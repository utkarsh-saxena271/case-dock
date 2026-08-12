import instance from "../../api/axiosConfig";
import type { Permission } from "../../types/permissions";
import { loadJoinRequests, loadMembers, removeJoinRequest, removeMember, updateMembersInStore } from "../slices/membershipSlice";
import type { AppDispatch, RootState } from "../store";

interface ReviewJoinRequest{
    chamberId:string,
    membershipId:string,
    action:'approve' | 'reject',
    permissions?:Permission[]
}

interface UpdateMember{
    chamberId:string,
    membershipId:string,
    role:'ADMIN' | 'MEMBER',
    permissions?:Permission[]
}

interface RemoveMember{
    chamberId:string,
    membershipId:string
}


export const fetchMembers = (chamberId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;

        const res = await instance.get(`/chamber/${chamberId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadMembers(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const fetchJoinRequests = (chamberId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;

        const res = await instance.get(`/chamber/${chamberId}/join-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(loadJoinRequests(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const createJoinRequest = (chamberId: string) => async (_dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;

        const res = await instance.post(`/chamber/${chamberId}/join-requests`,{}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const reviewJoinRequest = (data: ReviewJoinRequest) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;
        const {chamberId, membershipId} = data
        const res = await instance.patch(`/chamber/${chamberId}/join-requests/${membershipId}`,{action:data.action, permissions:data.permissions}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(removeJoinRequest(membershipId))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const updateMember = (data: UpdateMember) => async (dispatch:AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;
        const {chamberId, membershipId} = data
        const res = await instance.patch(`/chamber/${chamberId}/members/${membershipId}`,{role:data.role, permissions:data.permissions}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(updateMembersInStore(res.data.data))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const removeMemberDel = (data: RemoveMember) => async (dispatch:AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const token = state.auth.accessToken;
        const {chamberId, membershipId} = data
        const res = await instance.delete(`/chamber/${chamberId}/members/${membershipId}`,{
            headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(removeMember(membershipId))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}