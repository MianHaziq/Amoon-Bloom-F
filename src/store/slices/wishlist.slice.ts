import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/features/products/types";

export interface WishlistItem {
  productId: string;
  slug: string;
  title: string;
  imageUrl?: string;
  unitPrice: number;
  currency: string;
  addedAt: string;
}

export interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = { items: [] };

const toItem = (product: Product): WishlistItem => ({
  productId: product.id,
  slug: product.slug,
  title: product.title,
  imageUrl: product.images[0]?.url,
  unitPrice: product.price.amount,
  currency: product.price.currency,
  addedAt: new Date().toISOString(),
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlistItem(state, action: PayloadAction<{ product: Product }>) {
      const { product } = action.payload;
      const idx = state.items.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(toItem(product));
      }
    },
    removeWishlistItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
    setWishlistItems(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },
  },
});

export const {
  toggleWishlistItem,
  removeWishlistItem,
  clearWishlist,
  setWishlistItems,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
