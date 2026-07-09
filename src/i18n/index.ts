import type { Locale } from "@/store/slices/ui.slice";
import { interpolate } from "./messages";
export { t, tCount, messages, type MessageKey } from "./messages";

export const LOCALE_COOKIE = "locale";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ar";
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Reads the locale cookie on the client (undefined on the server). */
export function readLocaleCookie(): Locale | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const v = m ? decodeURIComponent(m[1]) : undefined;
  return isLocale(v) ? v : undefined;
}

/** Persists the locale cookie (client) so SSR + interceptors agree. */
export function writeLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Pick the localized value: Arabic when locale=ar and an Arabic value exists. */
export function localized(
  en: string,
  ar: string | null | undefined,
  locale: Locale,
  vars?: Record<string, string | number>
): string {
  const str = locale === "ar" && ar ? ar : en;
  return interpolate(str, vars);
}
