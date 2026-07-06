/**
 * Backend-aligned product types. Mirrors `mapProduct()` in
 * Amoonis-Boutique-B/src/services/product.service.js exactly. The admin panel
 * and the new API hook layer consume these shapes; storefront UI types live
 * in `./types.ts` and are adapted in Phase 3.
 */

export interface ApiProductDescriptionBlock {
  id: string;
  title: string | null;
  title_ar: string | null;
  description: string;
  description_ar: string | null;
}

export interface ApiProductOptionGroup {
  id: string;
  title: string;
  title_ar: string | null;
  options: string[];
  options_ar: string[];
  /** Optional per-value image URLs, aligned by index with `options`. */
  optionImages?: string[];
}

export interface ApiProductCategoryRef {
  id: string;
  title: string;
  title_ar?: string | null;
}

export interface ApiProduct {
  id: string;
  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  price: number;
  discountedPrice: number | null;
  quantity: number;
  categoryId: string | null;
  category?: ApiProductCategoryRef | null;
  image: string | null;
  images: string[];
  descriptions: ApiProductDescriptionBlock[];
  productOptions: ApiProductOptionGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductDescriptionInput {
  title?: string | null;
  title_ar?: string | null;
  description: string;
  description_ar?: string | null;
}

export interface ApiProductOptionInput {
  title: string;
  title_ar?: string | null;
  options: string[];
  options_ar?: string[];
  /** Optional per-value image URLs, aligned by index with `options`. */
  optionImages?: string[];
}

export interface ApiProductCreateInput {
  title: string;
  title_ar?: string | null;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  price: number;
  discountedPrice?: number | null;
  quantity?: number;
  categoryId?: string | null;
  descriptions?: ApiProductDescriptionInput[];
  images?: string[];
  productOptions?: ApiProductOptionInput[];
}

export type ApiProductUpdateInput = Partial<ApiProductCreateInput>;

export interface ApiProductListParams {
  page?: number;
  limit?: number;
  /**
   * Region code (e.g. "UAE", "SA"). For SSR fetches it's sent as `?region=`;
   * client requests usually rely on the `X-Region` header set by the http
   * interceptor instead. Also doubles as the staff region filter.
   */
  region?: string;
}
