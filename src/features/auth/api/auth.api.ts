import { http } from "@/services/http";
import type {
  AuthCredentials,
  AuthSession,
  RegisterPayload,
  User,
} from "../types";

export const authApi = {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    const { data } = await http.post<AuthSession>("/auth/login", credentials);
    return data;
  },
  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await http.post<AuthSession>("/auth/register", payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await http.get<User>("/auth/me");
    return data;
  },
  async logout(): Promise<void> {
    await http.post("/auth/logout");
  },
};
