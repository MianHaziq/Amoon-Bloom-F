import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/lib/storage";

export interface ApiErrorPayload {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(STORAGE_KEYS.authToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorPayload>) => {
      const status = error.response?.status ?? 0;
      const payload: ApiErrorPayload = error.response?.data ?? {
        message: error.message || "Network error",
      };

      if (status === 401 && typeof window !== "undefined") {
        storage.remove(STORAGE_KEYS.authToken);
      }

      return Promise.reject(new ApiError(status, payload));
    }
  );

  return instance;
}

export const http = createHttpClient();
