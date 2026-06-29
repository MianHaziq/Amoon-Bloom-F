import { getCountry, type CountryCode } from "./data";

/**
 * The storefront region. The backend is region-aware: catalog visibility
 * (products, categories, sections, banners) is scoped by the region the client
 * sends via the `X-Region` header (client requests) or `?region=` query param
 * (SSR fetches). The chosen region code is mirrored into a cookie so both the
 * browser axios interceptor and server components can read it.
 */
export const REGION_COOKIE = "region";

/** Backend region `code` (the X-Region value) for a delivery-country choice. */
export function regionCodeForCountry(country: CountryCode): string {
  return getCountry(country).regionCode;
}

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
