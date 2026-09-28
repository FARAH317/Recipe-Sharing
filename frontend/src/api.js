import axios from "axios";
// Dev: Vite's proxy (vite.config.js) forwards "/api" to your local Django server.
// Prod: set VITE_API_BASE in Vercel's env vars to your Render backend URL + "/api".
const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
    return Promise.reject(error);
  }
);
export async function login(username, password) {
  const { data } = await axios.post(`${API_BASE}/token/`, { username, password });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
}
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}
export default api;
