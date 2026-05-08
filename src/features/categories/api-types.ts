/**
 * Backend-aligned category types. Storefront-shaped `Category` lives in
 * `./types.ts` and is kept stable; admin and the API layer use these.
 */

import type { ApiProduct } from "@/features/products/api-types";

export interface ApiCategory {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  image: string | null;
  totalProducts: number;
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
}

export type ApiCategoryUpdateInput = Partial<ApiCategoryCreateInput>;
