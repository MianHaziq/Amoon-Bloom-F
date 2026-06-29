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

/**
 * Translate a raw axios error into a user-friendly message. The backend's
 * `{ success:false, message }` envelope is preferred when present; we only
 * fall back to a generic message for transport-level failures (no response,
 * timeouts, CORS) and unhelpful server messages.
 */
function deriveMessage(error: AxiosError<ApiErrorPayload>): string {
  const serverMessage = error.response?.data?.message;
  if (serverMessage && serverMessage.trim().length > 0) {
    return serverMessage;
  }

  // No response → transport problem.
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }
    return "Could not reach the server. Check your connection and try again.";
  }

  const status = error.response.status;
  if (status >= 500) {
    return "The server is having trouble right now. Please try again in a moment.";
  }
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You don't have permission to do that.";
  }
  if (status === 404) {
    return "We couldn't find what you were looking for.";
  }
  if (status === 409) {
    return "That action conflicts with the current state — please refresh and try again.";
  }

  return error.message || "Something went wrong. Please try again.";
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
    // Region scoping: the backend reads `X-Region` (a region code) to decide
    // which catalog the storefront sees. Read it from the cookie on the client.
    // (Server Components can't see this cookie here — they pass `?region=`
    // explicitly via getServerRegion(); the header always wins if both present.)
    if (typeof document !== "undefined" && config.headers) {
      const match = document.cookie.match(/(?:^|;\s*)region=([^;]+)/);
      const region = match ? decodeURIComponent(match[1]) : null;
      if (region && !config.headers["X-Region"]) {
        config.headers["X-Region"] = region;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorPayload>) => {
      const status = error.response?.status ?? 0;
      const message = deriveMessage(error);
      const payload: ApiErrorPayload = {
        message,
        code: error.response?.data?.code,
        details: error.response?.data?.details,
      };

      // 401 from a real response means the token is no longer valid — clear
      // it so the next render-cycle redirects unauthenticated. We don't
      // touch storage on transport errors (status 0); a temporary network
      // hiccup shouldn't sign the user out.
      if (status === 401 && typeof window !== "undefined") {
        storage.remove(STORAGE_KEYS.authToken);
      }

      return Promise.reject(new ApiError(status, payload));
    }
  );

  return instance;
}

export const http = createHttpClient();
