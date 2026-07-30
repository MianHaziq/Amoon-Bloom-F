import { cookies, headers } from "next/headers";
import type { Locale } from "@/store/slices/ui.slice";
import { t, type MessageKey } from "./messages";
import { LOCALE_COOKIE, isLocale } from "./index";
import { LOCALE_HEADER } from "@/features/location/routing";

/**
 * Server-only: read the active locale for SSR pages. The `/:region/:locale` URL
 * segment is the source of truth — the edge proxy validates it and injects it
 * as the `x-locale` request header, which we prefer here. Falls back to the
 * `locale` cookie (admin routes, which have no URL locale, still rely on it),
 * then English outside a request scope (build/static). Import only from Server
 * Components.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const fromHeader = h.get(LOCALE_HEADER);
    if (isLocale(fromHeader)) return fromHeader;
  } catch {
    // No header scope (build/static) — fall through to the cookie.
  }
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
