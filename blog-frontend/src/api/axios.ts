import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
// Token ekleyici
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {}; // Eğer headers tanımsızsa, boş bir nesneye ayarla
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
