import axios from 'axios'
import { store } from '../store/store';
import { logoutUser } from '../store/actions/authActions';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

// axiosConfig.ts
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite retry loop
      try {
        await instance.post('/auth/refresh'); // uses httpOnly cookie
        return instance(originalRequest); // retry the original failed request
      } catch (refreshError) {
        // refresh failed too — force logout
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance