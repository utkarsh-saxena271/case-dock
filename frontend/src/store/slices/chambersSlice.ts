import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { chambersAPI } from '@/lib/api';

interface Permissions {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

interface Chamber {
    _id: string;
    name: string;
    description?: string;
    admin: any;
    role?: 'admin' | 'member';
    permissions?: Permissions;
    hasPendingRequest?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Member {
    _id: string;
    user: any;
    role: 'admin' | 'member';
    permissions: Permissions;
    joinedAt: string;
}

interface JoinRequest {
    _id: string;
    user: any;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
}

interface ChambersState {
    chambers: Chamber[];
    searchResults: Chamber[];
    currentChamber: Chamber | null;
    members: Member[];
    joinRequests: JoinRequest[];
    loading: boolean;
    error: string | null;
}

const initialState: ChambersState = {
    chambers: [],
    searchResults: [],
    currentChamber: null,
    members: [],
    joinRequests: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchChambers = createAsyncThunk(
    'chambers/fetchChambers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.getChambers();
            return response.data.chambers;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch chambers');
        }
    }
);

export const fetchChamberById = createAsyncThunk(
    'chambers/fetchChamberById',
    async (chamberId: string, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.getChamberById(chamberId);
            return response.data.chamber;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch chamber');
        }
    }
);

export const createChamber = createAsyncThunk(
    'chambers/createChamber',
    async (data: { name: string; description?: string }, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.createChamber(data);
            return response.data.chamber;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create chamber');
        }
    }
);

export const searchChambers = createAsyncThunk(
    'chambers/searchChambers',
    async (query: string | undefined, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.searchChambers(query);
            return response.data.chambers;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search chambers');
        }
    }
);

export const requestJoinChamber = createAsyncThunk(
    'chambers/requestJoin',
    async ({ chamberId, message }: { chamberId: string; message?: string }, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.requestJoin(chamberId, message);
            return { chamberId, request: response.data.request };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send join request');
        }
    }
);

export const fetchJoinRequests = createAsyncThunk(
    'chambers/fetchJoinRequests',
    async (chamberId: string, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.getJoinRequests(chamberId);
            return response.data.requests;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch join requests');
        }
    }
);

export const handleJoinRequest = createAsyncThunk(
    'chambers/handleJoinRequest',
    async (
        { chamberId, requestId, action, permissions }:
            { chamberId: string; requestId: string; action: 'approve' | 'reject'; permissions?: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await chambersAPI.handleJoinRequest(chamberId, requestId, action, permissions);
            return { requestId, request: response.data.request };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to handle request');
        }
    }
);

export const fetchMembers = createAsyncThunk(
    'chambers/fetchMembers',
    async (chamberId: string, { rejectWithValue }) => {
        try {
            const response = await chambersAPI.getMembers(chamberId);
            return response.data.members;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
        }
    }
);

export const updateMemberPermissions = createAsyncThunk(
    'chambers/updateMemberPermissions',
    async (
        { chamberId, memberId, permissions }: { chamberId: string; memberId: string; permissions: Permissions },
        { rejectWithValue }
    ) => {
        try {
            const response = await chambersAPI.updateMemberPermissions(chamberId, memberId, permissions);
            return response.data.member;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update permissions');
        }
    }
);

export const removeMember = createAsyncThunk(
    'chambers/removeMember',
    async ({ chamberId, memberId }: { chamberId: string; memberId: string }, { rejectWithValue }) => {
        try {
            await chambersAPI.removeMember(chamberId, memberId);
            return memberId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
        }
    }
);

export const leaveChamber = createAsyncThunk(
    'chambers/leaveChamber',
    async (chamberId: string, { rejectWithValue }) => {
        try {
            await chambersAPI.leaveChamber(chamberId);
            return chamberId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to leave chamber');
        }
    }
);

const chambersSlice = createSlice({
    name: 'chambers',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentChamber: (state) => {
            state.currentChamber = null;
            state.members = [];
            state.joinRequests = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Chambers
            .addCase(fetchChambers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChambers.fulfilled, (state, action: PayloadAction<Chamber[]>) => {
                state.loading = false;
                state.chambers = action.payload;
            })
            .addCase(fetchChambers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Chamber by ID
            .addCase(fetchChamberById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChamberById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChamber = action.payload;
                if (action.payload.members) {
                    state.members = action.payload.members;
                }
            })
            .addCase(fetchChamberById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Chamber
            .addCase(createChamber.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createChamber.fulfilled, (state, action: PayloadAction<Chamber>) => {
                state.loading = false;
                state.chambers.unshift({ ...action.payload, role: 'admin' });
            })
            .addCase(createChamber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Search Chambers
            .addCase(searchChambers.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchChambers.fulfilled, (state, action: PayloadAction<Chamber[]>) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchChambers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Request Join
            .addCase(requestJoinChamber.fulfilled, (state, action) => {
                const chamber = state.searchResults.find(c => c._id === action.payload.chamberId);
                if (chamber) {
                    chamber.hasPendingRequest = true;
                }
            })
            // Fetch Join Requests
            .addCase(fetchJoinRequests.fulfilled, (state, action: PayloadAction<JoinRequest[]>) => {
                state.joinRequests = action.payload;
            })
            // Handle Join Request
            .addCase(handleJoinRequest.fulfilled, (state, action) => {
                state.joinRequests = state.joinRequests.filter(r => r._id !== action.payload.requestId);
            })
            // Fetch Members
            .addCase(fetchMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
                state.members = action.payload;
            })
            // Update Member Permissions
            .addCase(updateMemberPermissions.fulfilled, (state, action) => {
                const index = state.members.findIndex(m => m._id === action.payload._id);
                if (index !== -1) {
                    state.members[index] = action.payload;
                }
            })
            // Remove Member
            .addCase(removeMember.fulfilled, (state, action: PayloadAction<string>) => {
                state.members = state.members.filter(m => m._id !== action.payload);
            })
            // Leave Chamber
            .addCase(leaveChamber.fulfilled, (state, action: PayloadAction<string>) => {
                state.chambers = state.chambers.filter(c => c._id !== action.payload);
                state.currentChamber = null;
                state.members = [];
                state.joinRequests = [];
            });
    },
});

export const { clearError, clearCurrentChamber } = chambersSlice.actions;
export default chambersSlice.reducer;
