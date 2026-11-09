import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the saved login token (if there is one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Pull the friendly message out of an API error
export function getErrorMessage(error) {
  return error.response?.data?.message || "Something went wrong. Please try again.";
}

export default api;