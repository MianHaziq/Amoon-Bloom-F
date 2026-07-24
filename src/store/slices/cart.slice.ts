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
  /** Gift-card/custom-name add-on selections. `unitPrice` already includes their cost. */
  giftCardSelected?: boolean;
  customName?: string | null;
  /** Snapshot of the product's resolved "ships within N day(s)" lead time at add-to-cart
   *  time, for display only (cart drawer/page, checkout review). */
  deliveryLeadDays?: number;
}

/** Mirrors the backend's productService.optionExtraCharge exactly — only counts a
 * selection if the PRODUCT actually has that option enabled. Client-side mirror
 * purely for instant cart display; the backend remains authoritative at checkout. */
function optionExtraCharge(
  product: Product,
  giftCardSelected?: boolean,
  customName?: string | null
): number {
  let extra = 0;
  if (giftCardSelected && product.giftCardEnabled) extra += product.giftCardExtraPrice ?? 0;
  if (customName && product.customNameEnabled) extra += product.customNamePrice ?? 0;
  return extra;
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
        giftCardSelected?: boolean;
        customName?: string | null;
        message?: string | null;
      }>
    ) {
      const { product, quantity = 1, selectedOptions, giftCardSelected, customName, message } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
        // Cart lines are still one-per-product, not variant-aware — adding a
        // different variant of an already-cart'd product overwrites the
        // selection on that single line (last wins), mirroring the backend.
        if (selectedOptions !== undefined) existing.selectedOptions = selectedOptions;
        if (giftCardSelected !== undefined) existing.giftCardSelected = giftCardSelected;
        if (customName !== undefined) existing.customName = customName;
        if (message !== undefined) existing.message = message;
        existing.deliveryLeadDays = product.deliveryLeadDays;
        existing.unitPrice =
          product.price.amount + optionExtraCharge(product, existing.giftCardSelected, existing.customName);
        return;
      }
      state.items.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.images[0]?.url,
        unitPrice: product.price.amount + optionExtraCharge(product, giftCardSelected, customName),
        currency: product.price.currency,
        quantity,
        selectedOptions: selectedOptions ?? null,
        giftCardSelected: giftCardSelected ?? false,
        customName: customName ?? null,
        message: message ?? null,
        deliveryLeadDays: product.deliveryLeadDays,
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
