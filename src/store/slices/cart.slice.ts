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
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
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
