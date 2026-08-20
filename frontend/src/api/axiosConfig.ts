import axios from 'axios'
import { store } from '../store/store'
import { setAccessToken, clearCredentials } from '../store/slices/authSlice'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

// Tracks an in-flight refresh call so parallel 401s share one refresh
// instead of each firing their own /auth/refresh request.
let refreshPromise: Promise<string> | null = null

const refreshAccessTokenOnce = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = instance
      .post('/auth/refresh')
      .then((res) => {
        const accessToken = res.data.data.accessToken
        store.dispatch(setAccessToken({ accessToken }))
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't try to "refresh" a failed refresh call itself, and only
    // retry once per request (avoids infinite retry loops).
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessTokenOnce()
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        }
        return instance(originalRequest)
      } catch (refreshError) {
        store.dispatch(clearCredentials())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default instance