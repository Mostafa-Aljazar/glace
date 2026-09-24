import axios, {
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "@/lib/dataSource";
import { useAuthStore } from "@/store/authStore";

const jsonHeaders = { Accept: "application/json" };

function attachBaseUrl(config: InternalAxiosRequestConfig) {
  config.baseURL = getApiBaseUrl();
  return config;
}

// Public axios instance (no auth header, suitable for public fetches)
const guestApi = axios.create({ headers: jsonHeaders });
guestApi.interceptors.request.use(attachBaseUrl);

// Authenticated axios instance (default export) — keeps existing behaviour
const userApi = axios.create({ headers: jsonHeaders });
userApi.interceptors.request.use(attachBaseUrl);

userApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // First, try getting token from zustand store (if hydrated)
    const storeToken = useAuthStore.getState().token;
    if (storeToken) {
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      const headers = config.headers as AxiosRequestHeaders;
      headers["Authorization"] = `${storeToken}`;
      return config;
    }

    // Fallback to localStorage if store token not available yet
    const raw = localStorage.getItem("glace-auth");
    if (raw) {
      try {
        const { state } = JSON.parse(raw);
        if (state?.token) {
          if (!config.headers) config.headers = {} as AxiosRequestHeaders;
          const headers = config.headers as AxiosRequestHeaders;
          headers["Authorization"] = `${state.token}`;
        }
      } catch {
        // ignore malformed storage
      }
    }
  }
  return config;
});

export { guestApi, userApi };