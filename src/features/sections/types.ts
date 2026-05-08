/**
 * Section types — match `mapSection` shape: a curated collection of
 * featured products + categories with sortOrder.
 */

import type { ApiCategory } from "@/features/categories/api-types";
import type { ApiProduct } from "@/features/products/api-types";

export interface ApiSection {
  id: string;
  title: string;
  title_ar: string | null;
  image: string | null;
  sortOrder: number;
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
}

export type ApiSectionUpdateInput = Partial<ApiSectionCreateInput>;
