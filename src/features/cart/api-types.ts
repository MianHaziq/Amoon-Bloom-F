/**
 * Backend-aligned cart types. Storefront's local Redux cart works on the
 * UI-shaped `Product`; the server cart returned here mirrors `cart.service.js`
 * output exactly. Phase 3 reconciles guest/local cart with server cart.
 */

import type { ApiProduct } from "@/features/products/api-types";

/** Per-unit cash arrangement on a cart line (server + add-input shape). */
export interface ApiCartLineCashArrangement {
  cashAmount: number;
  denomination?: number | null;
  note?: string | null;
}

export interface ApiCartItem {
  id: string;
  productId: string;
  product: ApiProduct;
  quantity: number;
  message: string | null;
  /** Chosen variant, e.g. {"Colour":"Pink"} — keyed by the option group title. */
  selectedOptions?: Record<string, string> | null;
  /** Normalized variant discriminator for this line — echo back on quantity/remove
   *  to target this exact line when a product has several variant lines. */
  variantKey?: string;
  /** Photo of the chosen variant (backend-derived), or null to use the product's primary image. */
  selectedImage?: string | null;
  giftCardSelected?: boolean;
  customName?: string | null;
  /** Per-unit cash arrangement for this line (null = none). */
  cashArrangement?: ApiCartLineCashArrangement | null;
  lineTotal: number;
}

export interface ApiCart {
  id: string;
  items: ApiCartItem[];
  totalAmount: number;
  orderMessage: string | null;
}

export interface ApiCartAddInput {
  productId: string;
  quantity?: number;
  message?: string | null;
  selectedOptions?: Record<string, string> | null;
  giftCardSelected?: boolean;
  customName?: string | null;
  cashArrangement?: ApiCartLineCashArrangement | null;
}

export interface ApiCartQuantityInput {
  productId: string;
  quantity: number;
  /** Target a specific variant line; omit for legacy single-line behaviour. */
  variantKey?: string;
}

export interface ApiCartItemMessageInput {
  productId: string;
  message?: string | null;
  variantKey?: string;
}

export interface ApiCartSuggestionSection {
  category: { id: string; title: string };
  headline: string;
  subhead: string;
  products: ApiProduct[];
}

/**
 * Shape of `GET /cart/suggestions` (mirrors cart.service.getCartSuggestions):
 * per-category "more like this" sections plus a cross-category `discover` row.
 */
export interface ApiCartSuggestions {
  sections: ApiCartSuggestionSection[];
  discover: ApiProduct[];
  headline: string;
  hint: string;
}

export interface ApiCartSuggestionsParams {
  limitPerCategory?: number;
  discoverLimit?: number;
}
