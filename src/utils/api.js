import axios from "axios";
import { store } from "../store";
import { selectToken, refreshToken as refreshTokenAction, logout } from "../slices/authSlice";
import { refreshToken } from "../api/authRequests";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = selectToken(store.getState());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      try {
        const refreshResponse = await refreshToken();
        const newToken = refreshResponse.token;
        store.dispatch(refreshTokenAction(newToken));
        // Retry the original request
        return api(error.config);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
