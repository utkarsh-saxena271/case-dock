import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { MembershipStatus, Permission, Role } from "../../types/permissions"

interface Chamber {
  id: string
  name: string
  description: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface MembershipUser {
  id: string
  firstName: string
  lastName: string
  userName: string
  email: string
}

interface Membership {
  id: string
  role: Role
  status: MembershipStatus
  permissions: Permission[]
  user: MembershipUser
}

interface ChamberDetail extends Chamber {
  memberships: Membership[]
}

interface ChamberState {
  chambers: Chamber[]
  currentChamber: ChamberDetail | null
  discoverResults: Chamber[]
  discoverPagination: Pagination | null
}

const initialState: ChamberState = {
  chambers: [],
  currentChamber: null,
  discoverResults: [],
  discoverPagination: null
}

const chamberSlice = createSlice({
  name: 'chamber',
  initialState,
  reducers: {
    loadChambers: (state, action: PayloadAction<Chamber[]>) => {
      state.chambers = action.payload
    },
    addChamber: (state, action: PayloadAction<Chamber>) => {
      state.chambers.push(action.payload)
    },
    updateChamberInStore: (state, action: PayloadAction<Chamber>) => {
      state.chambers = state.chambers.map(c =>
        c.id === action.payload.id ? action.payload : c
      )
      if (state.currentChamber?.id === action.payload.id) {
        state.currentChamber = { ...state.currentChamber, ...action.payload }
      }
    },
    removeChamber: (state, action: PayloadAction<string>) => {
      state.chambers = state.chambers.filter(c => c.id !== action.payload)
    },
    setCurrentChamber: (state, action: PayloadAction<ChamberDetail>) => {
      state.currentChamber = action.payload
    },
    setDiscoverResults: (state, action: PayloadAction<{ chambers: Chamber[]; pagination: Pagination }>) => {
      state.discoverResults = action.payload.chambers
      state.discoverPagination = action.payload.pagination
    }
  }
})

export const {
  loadChambers,
  addChamber,
  updateChamberInStore,
  removeChamber,
  setCurrentChamber,
  setDiscoverResults
} = chamberSlice.actions

export default chamberSlice.reducer