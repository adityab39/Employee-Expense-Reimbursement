import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const ACCESS_TOKEN_KEY = "expense_access_token";
const REFRESH_TOKEN_KEY = "expense_refresh_token";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
if (storedAccessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedAccessToken}`;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (error.response?.status === 401 && refreshToken && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem("expense_user");
        delete api.defaults.headers.common.Authorization;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
