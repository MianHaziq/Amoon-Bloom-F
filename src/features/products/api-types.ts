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
  /** Optional per-value image URLs (first photo of each set), aligned with `options`. */
  optionImages?: string[];
  /** Optional per-value swatch colours (hex), aligned by index with `options`. */
  optionColors?: string[];
  /** Optional per-value image SETS (array-of-arrays), aligned with `options`. */
  optionImageSets?: string[][];
}

export interface ApiProductCategoryRef {
  id: string;
  title: string;
  title_ar?: string | null;
}

export interface ApiProductRegionRef {
  id: string;
  code: string;
  name: string;
  name_ar?: string | null;
}

export interface ApiProduct {
  id: string;
  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  price: number;
  discountedPrice: number | null;
  /** Manual Saudi Riyal price override (admin-entered, no auto FX). Null = not set. */
  priceSar?: number | null;
  discountedPriceSar?: number | null;
  /** Free gift-card message add-on, offered per product (most products have it). */
  giftCardEnabled?: boolean;
  giftCardExtraPrice?: number | null;
  /** Paid "add a custom name" add-on, offered only on select products (mugs/cups/boxes). */
  customNameEnabled?: boolean;
  customNamePrice?: number | null;
  quantity: number;
  categoryId: string | null;
  category?: ApiProductCategoryRef | null;
  /** Publish state. Storefront only ever sees PUBLISHED; staff reads include DRAFT. */
  status?: "DRAFT" | "PUBLISHED";
  /** Regions this product is visible in. Present on staff reads only. */
  regions?: ApiProductRegionRef[];
  regionIds?: string[];
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
  /** Optional per-value image URLs (first photo of each set), aligned with `options`. */
  optionImages?: string[];
  /** Optional per-value swatch colours (hex), aligned by index with `options`. */
  optionColors?: string[];
  /** Optional per-value image SETS (array-of-arrays), aligned with `options`. */
  optionImageSets?: string[][];
}

export interface ApiProductCreateInput {
  title: string;
  title_ar?: string | null;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  price: number;
  discountedPrice?: number | null;
  priceSar?: number | null;
  discountedPriceSar?: number | null;
  giftCardEnabled?: boolean;
  giftCardExtraPrice?: number | null;
  customNameEnabled?: boolean;
  customNamePrice?: number | null;
  quantity?: number;
  categoryId?: string | null;
  descriptions?: ApiProductDescriptionInput[];
  images?: string[];
  productOptions?: ApiProductOptionInput[];
  /** Publish state. Defaults to PUBLISHED from the admin form. */
  status?: "DRAFT" | "PUBLISHED";
  /** Regions this product should be visible in. Defaults to the default region (UAE) if omitted. */
  regionIds?: string[];
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
