import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("expense_access_token");
      localStorage.removeItem("expense_refresh_token");
      localStorage.removeItem("expense_user");
    }

    return Promise.reject(error);
  }
);

export default api;
