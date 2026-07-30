import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCachedRegions, getCachedCategories } from "@/services/catalogCache";
import { productsApi } from "@/features/products/api/products.api";
import { regionSlug, buildPrefix, withPrefix, LOCALES } from "@/features/location/routing";

/**
 * Multi-region, bilingual sitemap. Every active region gets its own
 * `/:slug/:locale/...` URL set, and each entry cross-links its English and
 * Arabic variants via `alternates.languages` (hreflang) so Google serves the
 * right language per searcher. This — together with the URL routing — is what
 * makes each region/language variant independently indexable (the whole point
 * of the permanent public routes).
 *
 * Locale-level alternates only (en ↔ ar within the SAME region): always valid
 * because both languages share one catalog. Cross-region hreflang is
 * intentionally omitted — a product/category need not exist in another region.
 */

const BASE = siteConfig.url.replace(/\/$/, "");
// Public, indexable storefront pages (relative to the region/locale prefix).
const STATIC_PATHS = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/branches",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/shipping-policy",
  "/product-disclaimer",
];
const PRODUCT_PAGE_SIZE = 100; // backend caps list limit at 100
const MAX_PRODUCT_PAGES = 50; // safety bound

/** One sitemap entry per (region, path): canonical URL = English, both locales in alternates. */
function entry(slug: string, path: string, lastModified?: string | Date): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE}${withPrefix(buildPrefix(slug, locale), path)}`;
  }
  languages["x-default"] = languages["en"];
  return {
    url: `${BASE}${withPrefix(buildPrefix(slug, "en"), path)}`,
    lastModified,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const regions = await getCachedRegions().catch(() => []);
  const active = regions.filter((r) => r.isActive);
  const entries: MetadataRoute.Sitemap = [];

  for (const region of active) {
    const slug = regionSlug(region);

    // Static pages.
    for (const path of STATIC_PATHS) entries.push(entry(slug, path));

    // Categories (region-scoped by code). Storefront URLs use the UUID id as the
    // slug (the backend has no slug field — see categories/adapters.ts).
    const categories = await getCachedCategories(region.code).catch(() => []);
    for (const c of categories) entries.push(entry(slug, `/shop/category/${c.id}`));

    // Products — page through the region's catalog (bounded).
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
      const res = await productsApi
        .list({ page, limit: PRODUCT_PAGE_SIZE, region: region.code })
        .catch(() => null);
      if (!res) break;
      for (const p of res.data) {
        entries.push(entry(slug, `/shop/${p.id}`));
      }
      const totalPages = res.meta?.pagination?.totalPages ?? page;
      if (page >= totalPages) break;
    }
  }

  return entries;
}
