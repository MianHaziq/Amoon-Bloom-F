import type { Money, Image } from "@/types";

/**
 * Storefront-facing product type. Used by PLP, PDP, cart, and product cards.
 * Backend-aligned shapes for the admin panel and raw API responses live in
 * `./api-types.ts` (`ApiProduct`, `ApiProductCreateInput`, etc.). Phase 3 will
 * migrate storefront consumers off mocks and onto adapted API data.
 */

export interface ProductOptionGroup {
  id: string;
  title: string;
  options: string[];
  /** Optional per-value image URLs (first photo of each set), aligned with `options`. */
  optionImages?: string[];
  /** Optional per-value swatch colours (hex), aligned by index with `options`. */
  optionColors?: string[];
  /** Optional per-value image SETS (array-of-arrays), aligned with `options`. */
  optionImageSets?: string[][];
  /** True when this group's values map 1:1 to `Product.variants` (e.g. "Size") —
   *  picking a value changes price/photos/contents, not just the photo. */
  isVariantAxis?: boolean;
}

/** One priced/photographed size (or other single-axis variant) of a product — e.g. the
 *  Small/Medium/Large Graduation Giveaway Box. `optionValue`/`optionValue_ar` match a
 *  value in the product's `isVariantAxis` option group. */
export interface ProductVariant {
  id: string;
  optionValue: string;
  optionValue_ar?: string;
  price: number;
  discountedPrice: number | null;
  images: string[];
  /** Already localized to the active locale by the adapter. */
  contents?: string;
  isDefault: boolean;
  /** This variant's own description blocks — empty/absent means it has no override
   *  and shares the product's top-level `descriptions` instead. */
  descriptions?: ProductDescriptionBlock[];
}

/** "From X to Y" price span across a product's variants. */
export interface ProductPriceRange {
  min: number;
  max: number;
}

export interface ProductDescriptionBlock {
  id: string;
  title?: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  descriptions?: ProductDescriptionBlock[];
  price: Money;
  compareAtPrice?: Money;
  images: Image[];
  category: string;
  categorySlug: string;
  collection?: string;
  inStock: boolean;
  badge?: "new" | "bestseller" | "limited" | "sale";
  rating?: number;
  reviewCount?: number;
  options?: ProductOptionGroup[];
  /** Small/Medium/Large-style variants, each with its own price/photos/contents.
   *  Absent/empty for the vast majority of products. */
  variants?: ProductVariant[];
  /** "From X to Y" span across variants — present only when `variants` is non-empty. */
  priceRange?: ProductPriceRange;
  tags?: string[];
  /** Free gift-card message add-on, offered per product (most products have it). */
  giftCardEnabled?: boolean;
  giftCardExtraPrice?: number;
  /** Paid "add a custom name" add-on, offered only on select products. */
  customNameEnabled?: boolean;
  customNamePrice?: number;
  /** Fully-resolved "ships within N day(s)" prep/booking lead time (product ->
   *  category -> site default). Always present on real API-adapted products. */
  deliveryLeadDays?: number;
  /** ISO creation timestamp — drives the "New arrivals" (newest-first) sort. */
  createdAt?: string;
}

export interface ProductFilter {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Selected colour option values (matched against product colour options). */
  colors?: string[];
  search?: string;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  inStock?: boolean;
}
