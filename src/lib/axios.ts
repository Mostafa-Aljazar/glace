import axios, { type AxiosRequestHeaders } from "axios";
import { getApiBaseUrl } from "@/lib/dataSource";

const BASE = getApiBaseUrl();

// Public axios instance (no auth header, suitable for public fetches)
const guestApi = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
});

// Authenticated axios instance (default export) — keeps existing behaviour
const userApi = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
});

userApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
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