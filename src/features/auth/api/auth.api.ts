import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  AuthCredentials,
  AuthSession,
  RegisterPayload,
  User,
} from "../types";
import { mapAuthSession, mapAuthUser } from "../adapters";

/**
 * Auth API client. Wraps `/auth/*` backend endpoints. The backend wraps its
 * responses in `{ success, data: { user, token } }` — we unwrap so callers
 * receive a clean `AuthSession`. Every returned user is normalised through
 * `mapAuthUser` so the backend's single `fullName` is mirrored into the
 * `name`/`firstName`/`lastName` fields the UI reads.
 */
export const authApi = {
  async signin(credentials: AuthCredentials): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/signin",
      credentials
    );
    return mapAuthSession(data.data);
  },

  async signup(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/signup",
      payload
    );
    return mapAuthSession(data.data);
  },

  async google(idToken: string): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>(
      "/auth/google",
      { idToken }
    );
    return mapAuthSession(data.data);
  },

  async apple(
    identityToken: string,
    profile?: Partial<Pick<User, "name" | "firstName" | "lastName" | "email">>
  ): Promise<AuthSession> {
    // Backend reads a single `name` for Apple's first sign-in; compose it.
    const fullName =
      profile?.name ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
      undefined;
    const { data } = await http.post<ApiResponse<AuthSession>>("/auth/apple", {
      identityToken,
      ...(profile?.email ? { email: profile.email } : {}),
      ...(fullName ? { name: fullName, fullName } : {}),
    });
    return mapAuthSession(data.data);
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
    return mapAuthUser(data.data as unknown as Record<string, unknown>);
  },

  async getUser(userId: string): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>(
      `/auth/user/${userId}`
    );
    return mapAuthUser(data.data as unknown as Record<string, unknown>);
  },

  async updateProfile(
    userId: string,
    payload: { fullName?: string; email?: string }
  ): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>(
      `/auth/profile/${userId}`,
      payload
    );
    return mapAuthUser(data.data as unknown as Record<string, unknown>);
  },

  async deleteAccount(userId: string, password?: string): Promise<void> {
    await http.delete(`/auth/delete-account/${userId}`, {
      data: password ? { password } : undefined,
    });
  },

  async getProfile(): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>("/user/profile");
    return mapAuthUser(data.data as unknown as Record<string, unknown>);
  },
};
