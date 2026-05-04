/**
 * Auth domain types. Mirrors the backend `AuthUser` shape (see
 * Amoonis-Boutique-B/src/controllers/auth.controller.js#authSessionUserFields)
 * with frontend-friendly field names.
 */
export interface User {
  id: string;
  email: string;
  /** Display name composed from firstName + lastName, or supplied separately. */
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: "CUSTOMER" | "ADMIN" | "MANAGER";
  isEmailVerified?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  /** Convenience single field used by the form; controller will split. */
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  isNewUser?: boolean;
}
