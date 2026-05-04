const isBrowser = typeof window !== "undefined";

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
    } catch {
      /* quota exceeded or storage disabled */
    }
  },
  remove(key: string): void {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};
