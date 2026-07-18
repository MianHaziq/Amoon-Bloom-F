/**
 * The storefront region. The backend is region-aware: catalog visibility
 * (products, categories, sections, banners) is scoped by the region the client
 * sends via the `X-Region` header (client requests) or `?region=` query param
 * (SSR fetches). The chosen region code is mirrored into a cookie so both the
 * browser axios interceptor and server components can read it.
 *
 * Regions are admin-managed data (`GET /regions`), not a fixed compile-time
 * list — `location.slice.ts`'s `country` field IS the region's `code` value
 * directly (e.g. "UAE", "SA"), with no separate country-code indirection.
 */
export const REGION_COOKIE = "region";

/** Seed value before any live region data has loaded (SSR/first paint only). */
export const DEFAULT_REGION_CODE = "UAE";

/** Reads the region cookie on the client (undefined on the server). */
export function readRegionCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)region=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Persists the region cookie (client). 1 year, lax, root path. */
export function writeRegionCookie(code: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REGION_COOKIE}=${encodeURIComponent(
    code
  )}; path=/; max-age=31536000; samesite=lax`;
}
