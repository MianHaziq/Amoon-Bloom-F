export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: "customer" | "admin";
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
}
