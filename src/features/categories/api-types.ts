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
  /** Regions this category is visible in. Present on staff reads only. */
  regions?: ApiProductRegionRef[];
  regionIds?: string[];
  /** Overrides Settings.defaultDeliveryLeadDays for every product in this category
   *  that doesn't set its own Product.deliveryLeadDays. Null = no override. */
  deliveryLeadDays?: number | null;
  /** Per-region overrides of the category lead time (staff reads). One entry per
   *  region the category is in; deliveryLeadDays null = no override for that region. */
  regionLeadDays?: ApiCategoryRegionLead[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoryRegionLead {
  regionId: string;
  deliveryLeadDays: number | null;
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
  /** Regions this category should be visible in. Defaults to the default region (UAE) if omitted. */
  regionIds?: string[];
  deliveryLeadDays?: number | null;
  /** Per-region lead-time overrides: [{ regionId, deliveryLeadDays }]. */
  regionLeadDays?: ApiCategoryRegionLead[];
}

export type ApiCategoryUpdateInput = Partial<ApiCategoryCreateInput>;
