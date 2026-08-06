/**
 * Section types — match `mapSection` shape: a curated collection of
 * featured products + categories with sortOrder.
 */

import type { ApiCategory } from "@/features/categories/api-types";
import type { ApiProduct, ApiProductRegionRef } from "@/features/products/api-types";

/** How a section lays out its products on the storefront, per breakpoint.
 *  SCROLL = horizontal swipeable rail (the historical default); GRID = wrapped
 *  fixed-column grid. See `resolveSectionDisplay` for defaults + column bounds. */
export type SectionLayout = "GRID" | "SCROLL";

/** Per-section display config as returned by `mapSection` (always present —
 *  not staff-gated, since the storefront needs it to render). */
export interface SectionDisplay {
  desktopLayout: SectionLayout;
  desktopColumns: number;
  /** Max products rendered on desktop (a 50-product section can show only 12). */
  desktopLimit: number;
  mobileLayout: SectionLayout;
  mobileColumns: number;
  /** Max products rendered on mobile. */
  mobileLimit: number;
}

export interface ApiSection {
  id: string;
  title: string;
  title_ar: string | null;
  image: string | null;
  sortOrder: number;
  /** Present on staff reads; storefront only ever receives PUBLISHED. */
  status?: "DRAFT" | "PUBLISHED";
  /** CUSTOM (default) for a plain curated rail. BEST_SELLERS/NEW_ARRIVALS
   *  additionally auto-fill remaining slots with real top-selling/newly
   *  published products — see section.service.js's augmentDynamicSection. Not
   *  staff-gated: the storefront needs this to build the right "View all" link. */
  kind?: "CUSTOM" | "BEST_SELLERS" | "NEW_ARRIVALS";
  /** Per-breakpoint storefront layout. Always returned by the API; optional here
   *  only so a cached/legacy payload without them still type-checks — read them
   *  through `resolveSectionDisplay` which fills the defaults. */
  desktopLayout?: SectionLayout;
  desktopColumns?: number;
  desktopLimit?: number;
  mobileLayout?: SectionLayout;
  mobileColumns?: number;
  mobileLimit?: number;
  /** Regions this section is visible in. Present on staff reads only. */
  regions?: ApiProductRegionRef[];
  regionIds?: string[];
  products: ApiProduct[];
  categories: ApiCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiSectionCreateInput {
  title: string;
  title_ar?: string | null;
  image?: string | null;
  productIds?: string[];
  /** Products the admin explicitly HID from a dynamic section's auto-grow. */
  excludedProductIds?: string[];
  categoryIds?: string[];
  sortOrder?: number;
  /** Publish state. Defaults to PUBLISHED from the admin form. */
  status?: "DRAFT" | "PUBLISHED";
  /** Defaults to CUSTOM server-side when omitted. */
  kind?: "CUSTOM" | "BEST_SELLERS" | "NEW_ARRIVALS";
  /** Per-breakpoint layout. Server defaults to SCROLL + 4/2 columns, limit 12 when omitted. */
  desktopLayout?: SectionLayout;
  desktopColumns?: number;
  desktopLimit?: number;
  mobileLayout?: SectionLayout;
  mobileColumns?: number;
  mobileLimit?: number;
  /** Regions this section should be visible in. Defaults to the default region (UAE) if omitted. */
  regionIds?: string[];
}

export type ApiSectionUpdateInput = Partial<ApiSectionCreateInput>;

/** Staff editor preview for a dynamic (Best Sellers/New Arrivals) section: the products
 *  auto-grow would surface beyond the curated picks (Pin/Hide candidates), plus the ones
 *  the admin has already hidden. Empty for CUSTOM sections. */
export interface ApiSectionEditorPreview {
  auto: ApiProduct[];
  excluded: ApiProduct[];
}
