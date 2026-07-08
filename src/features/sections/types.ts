/**
 * Section types — match `mapSection` shape: a curated collection of
 * featured products + categories with sortOrder.
 */

import type { ApiCategory } from "@/features/categories/api-types";
import type { ApiProduct, ApiProductRegionRef } from "@/features/products/api-types";

export interface ApiSection {
  id: string;
  title: string;
  title_ar: string | null;
  image: string | null;
  sortOrder: number;
  /** Present on staff reads; storefront only ever receives PUBLISHED. */
  status?: "DRAFT" | "PUBLISHED";
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
  categoryIds?: string[];
  sortOrder?: number;
  /** Publish state. Defaults to PUBLISHED from the admin form. */
  status?: "DRAFT" | "PUBLISHED";
  /** Regions this section should be visible in. Defaults to the default region (UAE) if omitted. */
  regionIds?: string[];
}

export type ApiSectionUpdateInput = Partial<ApiSectionCreateInput>;
