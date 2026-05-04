import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  AuthCredentials,
  AuthSession,
  RegisterPayload,
  User,
} from "../types";

/**
 * Auth API client. Wraps the backend endpoints in /auth/*. The backend wraps
 * its responses in `{ success, data: { user, token } }` — we unwrap so callers
 * receive a clean `AuthSession`.
 */
export const authApi = {
  async signin(credentials: AuthCredentials): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/signin",
      credentials
    );
    return data.data;
  },

  async signup(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/signup",
      payload
    );
    return data.data;
  },

  async google(idToken: string): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/google",
      { idToken }
    );
    return data.data;
  },

  async apple(
    identityToken: string,
    profile?: Pick<User, "name">
  ): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/apple",
      { identityToken, ...profile }
    );
    return data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await http.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await http.post("/auth/reset-password", { token, newPassword });
  },

  async getProfile(): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>("/user/profile");
    return data.data;
  },
};
