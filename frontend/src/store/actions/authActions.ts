import instance from '../../api/axiosConfig'
import { clearCredentials, setAccessToken, setCredentials, setUser } from '../slices/authSlice'
import type { AppDispatch, RootState } from '../store'



interface LoginPayload {
    email: string,
    password: string
}

interface RegisterPayload {
    fullName: {
        firstName: string,
        lastName: string
    },
    userName: string
    email: string,
    enrollmentNumber: string,
    password: string
}

interface ResetPassword {
    password:string,
    token:string
}


export const loginUser = (data: LoginPayload) => async (dispatch: AppDispatch) => {
    try {
        const res = await instance.post('/auth/login', data)
        console.log(res.data)
        dispatch(setCredentials({
            user: res.data.data.user,
            accessToken: res.data.data.accessToken
        }))

        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error('Login failed:', error.message)
        }
        throw error
    }
}

export const registerUser = (data: RegisterPayload) => async (_dispatch: AppDispatch) => {
    try {
        const res = await instance.post('/auth/register', data)
        return res.data
    } catch (error) {
        if (error instanceof Error) {
            console.error('Register failed', error.message)
        }
        throw error
    }
}

export const logoutUser = () => async (dispatch: AppDispatch) => {
    try {
        const res = await instance.post('/auth/logout')
        dispatch(clearCredentials())
        return res.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const refreshAccessToken = () => async (dispatch: AppDispatch) => {
    try {
        const res = await instance.post('/auth/refresh')
        const accessToken = res.data.data.accessToken
        dispatch(setAccessToken({ accessToken }))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const fetchMe = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState()
        const token = state.auth.accessToken

        const res = await instance.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        dispatch(setUser({ user: res.data.data }))
        return res.data.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error
    }
}

export const verifyEmail = (token: string) => async (_dispatch: AppDispatch) => {
    try {
        const res = await instance.get(`/auth/verify-email?token=${token}`)
        return res.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error;
    }
}

export const forgotPassword = (data:{email: string}) => async (_dispatch: AppDispatch) => {
    try {
        const res = await instance.post('/auth/forgot-password', data)
        return res.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error;
    }
}

export const resetPassword = (data: ResetPassword) => async (_dispatch: AppDispatch) => {
    try {
        const res = await instance.post(`/auth/reset-password?token=${data.token}`, {password:data.password})
        return res.data
    } catch (error) {
        if (error instanceof Error) {
            console.error(error)
        }
        throw error;
    }
}

