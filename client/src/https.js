// http.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

// expose a way to bind navigate from App.jsx
let navigateRef = null;
export const bindNavigator = (navigate) => { navigateRef = navigate; };

instance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data && config.data.user) delete config.data.user;
  return config;
});

const hardLogout = () => {
  localStorage.clear();
  if (navigateRef) navigateRef("/", { replace: true });
  else window.location = "/"; // fallback
};

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) hardLogout();
    return Promise.reject(error);
  }
);

export default instance;
