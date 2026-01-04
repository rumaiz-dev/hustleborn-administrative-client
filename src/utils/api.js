import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,                   
  timeout: 30000,                        
  withCredentials: true,                  
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status; 
    return Promise.reject(error);
  }
);

export default api;
