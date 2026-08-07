/**
 * Backend-aligned category types. Storefront-shaped `Category` lives in
 * `./types.ts` and is kept stable; admin and the API layer use these.
 */

import type { ApiProduct, ApiProductRegionRef } from "@/features/products/api-types";

export interface ApiCategory {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  image: string | null;
  totalProducts: number;
  /** Publish state. Storefront only ever sees PUBLISHED; staff reads include DRAFT. */
  status?: "DRAFT" | "PUBLISHED";
  /** "Coming soon": category (and all its products) visible but not orderable. */
  comingSoon?: boolean;
  /** Default gift-card input mode for this category's products (null = no default). */
  giftCardMode?: "MESSAGE" | "NAME" | null;
  /** How far a DRAFT status reaches (ignored while PUBLISHED). HOME_ONLY hides the
   *  category from the home page only (products still list in the Shop); ENTIRE_STORE
   *  also removes its products from every storefront surface. */
  draftScope?: "HOME_ONLY" | "ENTIRE_STORE";
  /** Regions this category is visible in. Present on staff reads only. */
  regions?: ApiProductRegionRef[];
  regionIds?: string[];
  /** Overrides Settings.defaultDeliveryLeadDays for every product in this category
   *  that doesn't set its own Product.deliveryLeadDays. Null = no override. */
  deliveryLeadDays?: number | null;
  /** Default cash-arrangement fee schedule for every product in this category that
   *  doesn't set its own (both-or-neither). Overridden per-region/per-zone below. */
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
  /** Per-region overrides of the category lead time (staff reads). One entry per
   *  region the category is in; deliveryLeadDays null = no override for that region. */
  regionLeadDays?: ApiCategoryRegionLead[];
  /** Per-zone overrides of the category lead time (staff reads). One entry per zone
   *  that has an override; may be empty/absent when no zone overrides exist. */
  zoneLeadDays?: ApiCategoryZoneLead[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoryRegionLead {
  regionId: string;
  deliveryLeadDays: number | null;
  /** Per-region cash-arrangement fee schedule override — both-or-neither. */
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
}

export interface ApiCategoryZoneLead {
  zoneId: string;
  deliveryLeadDays: number | null;
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
}

export interface ApiCategoryDetail extends ApiCategory {
  products: ApiProduct[];
}

export interface ApiCategoryCreateInput {
  title: string;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  image?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  /** "Coming soon": visible but not orderable. Server forces it off unless PUBLISHED. */
  comingSoon?: boolean;
  /** Default gift-card mode for the category's products. null/"MESSAGE"/"NAME". */
  giftCardMode?: "MESSAGE" | "NAME" | null;
  /** How far a DRAFT status reaches: HOME_ONLY (default) or ENTIRE_STORE. */
  draftScope?: "HOME_ONLY" | "ENTIRE_STORE";
  /** Regions this category should be visible in. Defaults to the default region (UAE) if omitted. */
  regionIds?: string[];
  deliveryLeadDays?: number | null;
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
  /** Per-region lead-time overrides: [{ regionId, deliveryLeadDays }]. */
  regionLeadDays?: ApiCategoryRegionLead[];
  /** Per-zone lead-time overrides: [{ zoneId, deliveryLeadDays }]. Full replace on update;
   *  entries with a null/blank lead are dropped server-side. */
  zoneLeadDays?: ApiCategoryZoneLead[];
}

export type ApiCategoryUpdateInput = Partial<ApiCategoryCreateInput>;
