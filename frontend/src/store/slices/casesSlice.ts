import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { casesAPI } from '@/lib/api';

interface CaseFile {
    fileName: string;
    fileUrl: string;
}

interface Case {
    _id: string;
    title: string;
    description: string;
    files: CaseFile[];
    status: 'open' | 'closed' | 'dismissed';
    nextDate: string;
    createdBy: any;
    chamber?: any;
    createdAt: string;
    updatedAt: string;
}

interface CasesState {
    cases: Case[];
    currentCase: Case | null;
    userPermissions: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: CasesState = {
    cases: [],
    currentCase: null,
    userPermissions: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchCases = createAsyncThunk(
    'cases/fetchCases',
    async (chamberId: string | undefined, { rejectWithValue }) => {
        try {
            const response = await casesAPI.getCases(chamberId);
            return response.data.cases;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
        }
    }
);

export const fetchCaseById = createAsyncThunk(
    'cases/fetchCaseById',
    async (caseId: string, { rejectWithValue }) => {
        try {
            const response = await casesAPI.getCaseById(caseId);
            return {
                case: response.data.case,
                userPermissions: response.data.userPermissions,
                userRole: response.data.userRole,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch case');
        }
    }
);

export const createCase = createAsyncThunk(
    'cases/createCase',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await casesAPI.createCase(formData);
            return response.data.case;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create case');
        }
    }
);

export const updateCase = createAsyncThunk(
    'cases/updateCase',
    async ({ caseId, formData }: { caseId: string; formData: FormData }, { rejectWithValue }) => {
        try {
            const response = await casesAPI.updateCase(caseId, formData);
            return response.data.case;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update case');
        }
    }
);

export const deleteCase = createAsyncThunk(
    'cases/deleteCase',
    async (caseId: string, { rejectWithValue }) => {
        try {
            await casesAPI.deleteCase(caseId);
            return caseId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete case');
        }
    }
);

const casesSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCase: (state) => {
            state.currentCase = null;
            state.userPermissions = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cases
            .addCase(fetchCases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCases.fulfilled, (state, action: PayloadAction<Case[]>) => {
                state.loading = false;
                state.cases = action.payload;
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Case by ID
            .addCase(fetchCaseById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCaseById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCase = action.payload.case;
                state.userPermissions = action.payload.userPermissions;
            })
            .addCase(fetchCaseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Case
            .addCase(createCase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCase.fulfilled, (state, action: PayloadAction<Case>) => {
                state.loading = false;
                state.cases.unshift(action.payload);
            })
            .addCase(createCase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Case
            .addCase(updateCase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCase.fulfilled, (state, action: PayloadAction<Case>) => {
                state.loading = false;
                state.currentCase = action.payload;
                const index = state.cases.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.cases[index] = action.payload;
                }
            })
            .addCase(updateCase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Case
            .addCase(deleteCase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCase.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.cases = state.cases.filter(c => c._id !== action.payload);
                if (state.currentCase?._id === action.payload) {
                    state.currentCase = null;
                }
            })
            .addCase(deleteCase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentCase } = casesSlice.actions;
export default casesSlice.reducer;
