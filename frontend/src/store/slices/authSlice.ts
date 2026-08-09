import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string,
  firstName: string,
  lastName: string,
  userName: string,
  email: string,
  emailVerified: boolean
}

interface AuthState {
  user: User | null,
  accessToken: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
    },setUser:(state,action:PayloadAction<{user:User}>) => {
      state.user = action.payload.user
    },
    setAccessToken:(state,action:PayloadAction<{accessToken:string}>) => {
      state.accessToken = action.payload.accessToken
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
    }
  }
})

export const { setCredentials, setUser, setAccessToken, clearCredentials } = authSlice.actions
export default authSlice.reducer