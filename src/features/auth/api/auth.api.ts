import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  AuthCredentials,
  AuthSession,
  RegisterPayload,
  User,
} from "../types";

/**
 * Auth API client. Wraps `/auth/*` backend endpoints. The backend wraps its
 * responses in `{ success, data: { user, token } }` — we unwrap so callers
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
    profile?: Partial<Pick<User, "name" | "firstName" | "lastName" | "email">>
  ): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>("/auth/apple", {
      identityToken,
      ...profile,
    });
    return data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await http.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await http.post("/auth/reset-password", { token, newPassword });
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>(
      `/auth/change-password/${userId}`,
      { currentPassword, newPassword }
    );
    return data.data;
  },

  async getUser(userId: string): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>(
      `/auth/user/${userId}`
    );
    return data.data;
  },

  async updateProfile(
    userId: string,
    payload: Partial<Pick<User, "firstName" | "lastName" | "email">>
  ): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>(
      `/auth/profile/${userId}`,
      payload
    );
    return data.data;
  },

  async deleteAccount(userId: string, password?: string): Promise<void> {
    await http.delete(`/auth/delete-account/${userId}`, {
      data: password ? { password } : undefined,
    });
  },

  async getProfile(): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>("/user/profile");
    return data.data;
  },
};
