import type { AuthSession, User } from "./types";

/**
 * The backend User has a single `fullName` — no first/last. The storefront reads
 * `firstName` (greetings), `name` (menus), etc., so we normalise at the API
 * boundary: keep `fullName` canonical and derive the convenience fields from it.
 * Every auth response passes through here so readers never see `undefined`.
 */
export function splitFullName(fullName?: string | null): {
  firstName?: string;
  lastName?: string;
} {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return {};
  const [first, ...rest] = trimmed.split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") || undefined };
}

/** Map a raw backend user (`{ fullName, ... }`) into the FE `User` shape. */
export function mapAuthUser(raw: Record<string, unknown>): User {
  const fullName =
    (raw.fullName as string | null | undefined) ??
    (raw.name as string | undefined) ??
    null;
  const { firstName, lastName } = splitFullName(fullName);
  return {
    ...(raw as unknown as User),
    fullName: fullName ?? undefined,
    name: fullName ?? "",
    firstName: (raw.firstName as string | undefined) ?? firstName,
    lastName: (raw.lastName as string | undefined) ?? lastName,
  };
}

/** Map an auth session (`{ user, token, ... }`), normalising its user. */
export function mapAuthSession(raw: AuthSession): AuthSession {
  return {
    ...raw,
    user: mapAuthUser(raw.user as unknown as Record<string, unknown>),
  };
}
