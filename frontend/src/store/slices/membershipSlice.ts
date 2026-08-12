import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Membership } from '../../types/membership'

interface MembershipState {
    members: Membership[]
    joinRequests: Membership[]
}

const initialState: MembershipState = {
    members: [],
    joinRequests: []
}


const membershipSlice = createSlice({
    name: "membership",
    initialState,
    reducers: {
        loadMembers: (state, action: PayloadAction<Membership[]>) => {
            state.members = action.payload
        },
        loadJoinRequests: (state, action: PayloadAction<Membership[]>) => {
            state.joinRequests = action.payload
        },
        removeJoinRequest: (state, action: PayloadAction<string>) => {
            state.joinRequests = state.joinRequests.filter(c => c.id !== action.payload)
        },
        updateMembersInStore: (state, action: PayloadAction<Membership>) => {
            state.members = state.members.map(c =>
                c.id === action.payload.id ? action.payload : c
            )
            
        },
        removeMember: (state, action: PayloadAction<string>) => {
            state.members = state.members.filter(c => c.id !== action.payload)
        },
    }
})

export const {
    loadMembers,
    loadJoinRequests,
    removeJoinRequest,
    updateMembersInStore,
    removeMember
} = membershipSlice.actions;

export default membershipSlice.reducer