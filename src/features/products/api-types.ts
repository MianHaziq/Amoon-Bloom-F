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
  /** True when this group's values map 1:1 to `ApiProduct.variants` (e.g. "Size") —
   *  picking a value changes price/photos/contents, not just the photo. At most one
   *  group per product is true. */
  isVariantAxis?: boolean;
}

/** One priced/photographed size (or other single-axis variant) of a product — e.g. the
 *  Small/Medium/Large Graduation Giveaway Box. `optionValue` matches a value in the
 *  product's `isVariantAxis` option group. Stock stays product-level (`ApiProduct.quantity`),
 *  not per-variant. */
export interface ApiProductVariant {
  id: string;
  optionValue: string;
  optionValue_ar: string | null;
  price: number;
  discountedPrice: number | null;
  images: string[];
  contents: string | null;
  contents_ar: string | null;
  isDefault: boolean;
  sortOrder: number;
  /** This variant's own description blocks (same shape as `ApiProduct.descriptions`).
   *  Empty = this size has no override and shares the product's shared blocks instead. */
  descriptions: ApiProductDescriptionBlock[];
}

/** "From X to Y" price span across a product's variants (each variant's own discounted
 *  price when it's lower). Null when the product has no variants. */
export interface ApiProductPriceRange {
  min: number;
  max: number;
}

export interface ApiProductCategoryRef {
  id: string;
  title: string;
  title_ar?: string | null;
  /** Overrides Settings.defaultDeliveryLeadDays for products in this category with no
   *  own Product.deliveryLeadDays. Null = no override. */
  deliveryLeadDays?: number | null;
}

export interface ApiProductRegionRef {
  id: string;
  code: string;
  name: string;
  name_ar?: string | null;
}

/** Per-region manual price override (no auto FX conversion). Null price/discountedPrice
 *  means that region falls back to the product's base price. */
export interface ApiProductRegionPrice {
  regionId: string;
  price: number | null;
  discountedPrice: number | null;
  /** Per-region "ships within N days" override for this product (null = none). */
  deliveryLeadDays?: number | null;
  /** Per-region cash-arrangement fee schedule override — both-or-neither (see
   *  utils/cashArrangementMath.js on the backend for the full precedence chain). */
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
}

/** Per-zone "ships within N days" + cash-arrangement fee overrides for this product. One
 *  entry per delivery zone that has ANY override; a null field means no override for that
 *  specific field (falls back to the region/product/category/default chain). */
export interface ApiProductZoneLead {
  zoneId: string;
  deliveryLeadDays: number | null;
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
}

export interface ApiProduct {
  id: string;
  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  price: number;
  discountedPrice: number | null;
  /** Per-region manual price overrides (admin-entered, no auto FX). Present on staff reads only. */
  regionPrices?: ApiProductRegionPrice[];
  /** Per-zone lead-time overrides (staff reads). One entry per zone that has an
   *  override; may be empty/absent when no zone overrides exist. */
  zoneLeadDays?: ApiProductZoneLead[];
  /** Free gift-card message add-on, offered per product (most products have it). */
  giftCardEnabled?: boolean;
  giftCardExtraPrice?: number | null;
  /** Paid "add a custom name" add-on, offered only on select products (mugs/cups/boxes). */
  customNameEnabled?: boolean;
  customNamePrice?: number | null;
  quantity: number;
  /** Overrides Category.deliveryLeadDays / Settings.defaultDeliveryLeadDays for this
   *  product specifically. Null = no override (falls through the resolution chain). */
  deliveryLeadDays?: number | null;
  /** Default cash-arrangement fee schedule for this product (both-or-neither). Overridden
   *  per-region/per-zone by the corresponding entries in regionPrices/zoneLeadDays. */
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
  /** Fully-resolved "ships within N day(s)" lead time (product -> category -> global
   *  default) — always a number, never null. Present on every public product read. */
  resolvedDeliveryLeadDays?: number;
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
  /** Small/Medium/Large-style variants, each with its own price/photos/contents. Empty
   *  for every product that doesn't use this (the vast majority). */
  variants: ApiProductVariant[];
  /** "From X to Y" span across variants. Null when the product has no variants. */
  priceRange: ApiProductPriceRange | null;
  /** Aggregated from the Review table — null/0 until the product has any reviews. */
  avgRating?: number | null;
  reviewCount?: number;
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
  /** Marks this group as the one whose values drive `variants` (e.g. "Size"). */
  isVariantAxis?: boolean;
}

export interface ApiProductVariantInput {
  optionValue?: string | null;
  optionValue_ar?: string | null;
  price: number;
  discountedPrice?: number | null;
  images?: string[];
  contents?: string | null;
  contents_ar?: string | null;
  isDefault?: boolean;
  /** Optional description-block override for this size. Omit/empty = shares the
   *  product's shared `descriptions` instead. */
  descriptions?: ApiProductDescriptionInput[];
}

export interface ApiProductCreateInput {
  title: string;
  title_ar?: string | null;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  price: number;
  discountedPrice?: number | null;
  /** Per-region manual price overrides. One entry per region that needs an override —
   *  a region left out (or with null price/discountedPrice) falls back to the base price. */
  regionPrices?: ApiProductRegionPrice[];
  /** Per-zone lead-time overrides: [{ zoneId, deliveryLeadDays }]. Full replace on update;
   *  entries with a null/blank lead are dropped server-side. */
  zoneLeadDays?: ApiProductZoneLead[];
  giftCardEnabled?: boolean;
  giftCardExtraPrice?: number | null;
  customNameEnabled?: boolean;
  customNamePrice?: number | null;
  quantity?: number;
  deliveryLeadDays?: number | null;
  cashArrangementFeeStepAmount?: number | null;
  cashArrangementFeeMarginPercent?: number | null;
  categoryId?: string | null;
  descriptions?: ApiProductDescriptionInput[];
  images?: string[];
  productOptions?: ApiProductOptionInput[];
  /** Optional Small/Medium/Large-style variants — full replace on update when sent.
   *  Empty/omitted = a plain product (unchanged behavior). */
  variants?: ApiProductVariantInput[];
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
