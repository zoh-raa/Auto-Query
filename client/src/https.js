// http.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

const http = axios.create({
  baseURL: 'http://localhost:3001', // <-- Make sure this matches your backend port
  withCredentials: true, // if you use cookies/auth
});

// expose a way to bind navigate from App.jsx
let navigateRef = null;
export const bindNavigator = (navigate) => { navigateRef = navigate; };

// Add Authorization header to http instance as well
http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data && config.data.user) delete config.data.user;
  return config;
});

instance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data && config.data.user) delete config.data.user;
  return config;
});

// Add Authorization header to http instance as well
http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data && config.data.user) delete config.data.user;
  return config;
});

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

export default http;
export { instance, http }; // ✅ now http is available as a named export too
