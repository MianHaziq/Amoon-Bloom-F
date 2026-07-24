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
  createdAt: string;
  updatedAt: string;
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
}

export type ApiCategoryUpdateInput = Partial<ApiCategoryCreateInput>;
