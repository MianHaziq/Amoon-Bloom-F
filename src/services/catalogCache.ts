/**
 * Cached catalog data layer for Server Components.
 *
 * The storefront reads the region cookie per request, which opts routes into
 * dynamic rendering — so a page-level `revalidate` is ignored. Instead we cache
 * the *data* here: each function wraps its API call in `unstable_cache` (cross-
 * request Data Cache, region-keyed) and `react.cache` (in-request dedup so the
 * same record fetched by both `generateMetadata` and the page hits the network
 * once).
 *
 * IMPORTANT: cookies must NOT be read inside a cached scope. Callers read the
 * region cookie via `getServerRegion()` and pass it in as an argument, so it
 * becomes part of the cache key. Errors are intentionally NOT caught here — a
 * throw skips caching (so a transient backend blip isn't cached as empty);
 * callers keep their existing `.catch()` fallbacks.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { bannersApi } from "@/features/banners/api/banners.api";

// Reference/catalog data changes rarely (admin edits) → cache longer.
const CATALOG_TTL = 300; // 5 min: categories, sections, banners
// Product availability/stock is more volatile → shorter.
const PRODUCTS_TTL = 60; // 1 min: product lists & detail

const r = (region?: string) => region ?? "default";

// --- Categories -----------------------------------------------------------

const _categories = unstable_cache(
  (region?: string) => categoriesApi.list(region),
  ["catalog:categories"],
  { revalidate: CATALOG_TTL, tags: ["categories"] }
);
export const getCachedCategories = cache((region?: string) => _categories(region));

const _categoryById = unstable_cache(
  (region: string | undefined, id: string) => categoriesApi.getById(id, region),
  ["catalog:category-by-id"],
  { revalidate: CATALOG_TTL, tags: ["categories"] }
);
export const getCachedCategoryById = cache((region: string | undefined, id: string) =>
  _categoryById(r(region), id)
);

// --- Products -------------------------------------------------------------

const _productList = unstable_cache(
  (region: string | undefined, page: number, limit: number) =>
    productsApi.list({ page, limit, region }),
  ["catalog:product-list"],
  { revalidate: PRODUCTS_TTL, tags: ["products"] }
);
export const getCachedProductList = cache(
  (region: string | undefined, page = 1, limit = 24) =>
    _productList(r(region), page, limit)
);

const _productsByCategory = unstable_cache(
  (region: string | undefined, categoryId: string, limit: number) =>
    productsApi.listByCategory(categoryId, { limit, region }),
  ["catalog:products-by-category"],
  { revalidate: PRODUCTS_TTL, tags: ["products"] }
);
export const getCachedProductsByCategory = cache(
  (region: string | undefined, categoryId: string, limit = 24) =>
    _productsByCategory(r(region), categoryId, limit)
);

const _productById = unstable_cache(
  (region: string | undefined, id: string) => productsApi.getById(id, region),
  ["catalog:product-by-id"],
  { revalidate: PRODUCTS_TTL, tags: ["products"] }
);
export const getCachedProductById = cache((region: string | undefined, id: string) =>
  _productById(r(region), id)
);

// --- Home content ---------------------------------------------------------

const _sections = unstable_cache(
  (region?: string) => sectionsApi.list(region),
  ["catalog:sections"],
  { revalidate: CATALOG_TTL, tags: ["sections"] }
);
export const getCachedSections = cache((region?: string) => _sections(region));

const _banners = unstable_cache(
  (region: string, platform: "MOBILE" | "WEB") =>
    bannersApi.list(region === "default" ? undefined : region, platform),
  ["catalog:banners"],
  { revalidate: CATALOG_TTL, tags: ["banners"] }
);
// The website renders WEB banners (hero videos/images). Region + platform are both
// part of the cache key so mobile-vs-web and per-region lists never collide.
export const getCachedBanners = cache(
  (region?: string, platform: "MOBILE" | "WEB" = "WEB") =>
    _banners(r(region), platform)
);
