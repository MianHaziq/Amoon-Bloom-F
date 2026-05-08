/**
 * Backend-aligned cart types. Storefront's local Redux cart works on the
 * UI-shaped `Product`; the server cart returned here mirrors `cart.service.js`
 * output exactly. Phase 3 reconciles guest/local cart with server cart.
 */

import type { ApiProduct } from "@/features/products/api-types";

export interface ApiCartItem {
  id: string;
  productId: string;
  product: ApiProduct;
  quantity: number;
  message: string | null;
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
}

export interface ApiCartQuantityInput {
  productId: string;
  quantity: number;
}

export interface ApiCartItemMessageInput {
  productId: string;
  message?: string | null;
}

export interface ApiCartSuggestions {
  byCategory: Array<{
    categoryId: string;
    title: string;
    products: ApiProduct[];
  }>;
  discover: ApiProduct[];
}

export interface ApiCartSuggestionsParams {
  limitPerCategory?: number;
  discoverLimit?: number;
}
