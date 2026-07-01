import { cookies } from "next/headers";
import type { Locale } from "@/store/slices/ui.slice";
import { t, type MessageKey } from "./messages";
import { LOCALE_COOKIE, isLocale } from "./index";

/**
 * Server-only: read the active locale from the request cookie for SSR pages.
 * Defaults to English outside a request scope (build/static). Import only from
 * Server Components.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const v = store.get(LOCALE_COOKIE)?.value;
    return isLocale(v) ? v : "en";
  } catch {
    return "en";
  }
}

/** Server-side translator bound to the request's locale. */
export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: MessageKey, vars?: Record<string, string | number>) =>
      t(locale, key, vars),
  };
}
