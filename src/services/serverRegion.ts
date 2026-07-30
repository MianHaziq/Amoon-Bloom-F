import { cookies, headers } from "next/headers";
import { REGION_COOKIE, ZONE_COOKIE } from "@/features/location/region";
import {
  REGION_SLUG_HEADER,
  REGION_SLUG_COOKIE,
  DEFAULT_REGION_SLUG,
  codeForSlug,
  slugForCode,
  buildPrefix,
} from "@/features/location/routing";
import { getCachedRegions } from "@/services/catalogCache";
import { getServerLocale } from "@/i18n/server";

/**
 * The region SLUG for the current request. The `/:region/:locale` URL segment is
 * the source of truth: the edge proxy validates it and injects it as the
 * `x-region-slug` header. Falls back to the `region_slug` cookie (bare-path
 * first visits). Returns undefined when neither is present. Slug is a WEB
 * routing token — see routing.ts; it is mapped to the region CODE for API
 * scoping in `getServerRegion` below.
 */
async function readRequestRegionSlug(): Promise<string | undefined> {
  try {
    const h = await headers();
    const fromHeader = h.get(REGION_SLUG_HEADER);
    if (fromHeader) return fromHeader;
  } catch {
    // No header scope (build/static) — fall through to the cookie.
  }
  try {
    const store = await cookies();
    return store.get(REGION_SLUG_COOKIE)?.value || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Server-only: the storefront region CODE (e.g. "UAE") for SSR catalog fetches,
 * passed as `?region=` to the public list/detail endpoints. Resolved from the
 * URL slug (via the live regions list) with the `region` cookie as a fallback.
 * Returns undefined outside a request scope (build/static) → backend uses its
 * default region. API scoping is unchanged — this still yields a `code`, never a
 * slug. Only import from Server Components.
 */
export async function getServerRegion(): Promise<string | undefined> {
  const slug = await readRequestRegionSlug();
  if (slug) {
    const regions = await getCachedRegions().catch(() => []);
    const code = codeForSlug(regions, slug);
    if (code) return code;
  }
  try {
    const store = await cookies();
    // The `region` cookie already holds a CODE (kept in sync by LocationPersistence).
    return store.get(REGION_COOKIE)?.value || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Server-only: the region SLUG for the current request (e.g. "ae"), for building
 * localized links/canonicals in Server Components. Falls back to mapping the
 * `region` cookie CODE → slug via the live list, then the default slug.
 */
export async function getServerRegionSlug(): Promise<string> {
  const slug = await readRequestRegionSlug();
  if (slug) return slug;
  try {
    const store = await cookies();
    const code = store.get(REGION_COOKIE)?.value;
    if (code) {
      const regions = await getCachedRegions().catch(() => []);
      const mapped = slugForCode(regions, code);
      if (mapped) return mapped;
    }
  } catch {
    // No request scope — fall through to the default.
  }
  return DEFAULT_REGION_SLUG;
}

/**
 * Server-only: the full `/:regionSlug/:locale` route prefix for the current
 * request, for prefixing hrefs/canonicals built in Server Components.
 */
export async function getServerPrefix(): Promise<string> {
  const [slug, locale] = await Promise.all([getServerRegionSlug(), getServerLocale()]);
  return buildPrefix(slug, locale);
}

/**
 * Server-only: the selected delivery zone/city NAME from the cookie (set by
 * LocationPersistence). The product page resolves this name → zone id within the
 * current region to fetch a zone-accurate delivery-days estimate. Returns
 * undefined outside a request scope.
 */
export async function getServerZoneName(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(ZONE_COOKIE)?.value || undefined;
  } catch {
    return undefined;
  }
}
