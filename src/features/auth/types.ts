/**
 * Auth domain types. Mirrors the backend `authSessionUserFields` shape (see
 * Amoonis-Boutique-B/src/controllers/auth.controller.js). The `/auth/*` and
 * `/user/profile` endpoints return the raw enum values for `role` and
 * `status` (e.g. "ADMIN", "ACTIVE"); admin `/users/*` endpoints capitalize.
 */

import type { ManagerPermission } from "@/features/users/types";

export type AuthRole = "CUSTOMER" | "ADMIN" | "MANAGER";
export type AuthStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  email: string;
  /** Canonical name field from the backend (a single field; no first/last). */
  fullName?: string | null;
  /** Mirrors `fullName`; kept for existing readers. */
  name: string;
  /** Derived on receipt by splitting `fullName` — the backend has no such fields. */
  firstName?: string;
  lastName?: string;
  avatar?: string;
  /** @deprecated Use `avatar` to match backend. Kept for back-compat. */
  avatarUrl?: string;
  role?: AuthRole;
  status?: AuthStatus;
  isEmailVerified?: boolean;
  hasPassword?: boolean;
  isGoogleUser?: boolean;
  managerTitle?: string | null;
  managerPermissions?: ManagerPermission[];
  preferredLanguage?: string;
  phone?: string | null;
  addressCountry?: string | null;
  addressCity?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  /** The backend stores a single `fullName` — send it directly. */
  fullName: string;
}

export interface AuthSession {
  user: User;
  token: string;
  isNewUser?: boolean;
}
