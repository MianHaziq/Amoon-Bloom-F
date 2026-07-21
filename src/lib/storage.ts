import { STORAGE_KEYS } from "@/constants/storage-keys";

const isBrowser = typeof window !== "undefined";

// Mirrors *presence* (not the token itself) into a plain cookie so `proxy.ts`
// can do an optimistic "is anyone signed in" redirect for /admin and /account
// before the client-side guard (AdminShell/AccountGuard) even mounts. This
// cookie carries no auth value of its own — it's unreadable-as-a-credential,
// just a hint the edge can check without access to localStorage.
const SESSION_COOKIE = "amoonis.session";

function setSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export const storage = {
  get<T = string>(key: string): T | null {
    if (!isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      if (key === STORAGE_KEYS.authToken) setSessionCookie();
    } catch {
      /* quota exceeded or storage disabled */
    }
  },
  remove(key: string): void {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
    if (key === STORAGE_KEYS.authToken) clearSessionCookie();
  },
};
