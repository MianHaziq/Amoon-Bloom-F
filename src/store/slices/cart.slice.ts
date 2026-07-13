import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/features/products/types";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  imageUrl?: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  /** Optional per-item note (gift message / engraving). Mirrors the server cart. */
  message?: string | null;
  /** Chosen variant, e.g. {"Colour":"Pink"} — keyed by the option group title. */
  selectedOptions?: Record<string, string> | null;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        selectedOptions?: Record<string, string> | null;
      }>
    ) {
      const { product, quantity = 1, selectedOptions } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
        // Cart lines are still one-per-product, not variant-aware — adding a
        // different variant of an already-cart'd product overwrites the
        // selection on that single line (last wins), mirroring the backend.
        if (selectedOptions !== undefined) existing.selectedOptions = selectedOptions;
        return;
      }
      state.items.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.images[0]?.url,
        unitPrice: product.price.amount,
        currency: product.price.currency,
        quantity,
        selectedOptions: selectedOptions ?? null,
      });
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (i) => i.productId !== action.payload.productId
        );
        return;
      }
      item.quantity = action.payload.quantity;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    /** Replace the whole cart in one shot — used to hydrate from localStorage. */
    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart, setItems } =
  cartSlice.actions;

export default cartSlice.reducer;
