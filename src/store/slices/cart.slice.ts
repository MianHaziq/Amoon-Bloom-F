import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/features/products/types";
import { lineVariantKey, type LineCashArrangement } from "@/features/cart/variantKey";
import { resolveVariantForSelection, effectiveVariantPrice } from "@/features/products/variantResolution";

/** Per-UNIT "add cash arrangement" for a cart line. The fee is NOT stored here — it's
 *  resolved authoritatively at checkout/order time from the cart+region+zone. Two units of
 *  the same product with different cash configs are separate lines (folded into variantKey). */
export interface CartLineCashArrangement {
  cashAmount: number;
  denomination: number | null;
  note: string;
}

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
  /** Normalized variant discriminator (see variantKeyOf). Two lines of the same
   *  product with different variants have different keys → separate cart lines. */
  variantKey: string;
  /** Gift-card/custom-name add-on selections. `unitPrice` already includes their cost. */
  giftCardSelected?: boolean;
  customName?: string | null;
  /** Per-unit cash arrangement for this line (null = none). Part of line identity. */
  cashArrangement?: CartLineCashArrangement | null;
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

/** Normalize a per-unit cash arrangement for storage/identity (positive amount, int
 *  denomination, trimmed note). Returns null when there's no positive amount. */
function normalizeLineCash(
  cash?: CartLineCashArrangement | LineCashArrangement | null
): CartLineCashArrangement | null {
  if (!cash || !(Number(cash.cashAmount) > 0)) return null;
  return {
    cashAmount: Math.round(Number(cash.cashAmount) * 100) / 100,
    denomination:
      cash.denomination != null && Number(cash.denomination) > 0
        ? Math.trunc(Number(cash.denomination))
        : null,
    note: (cash.note ?? "").trim(),
  };
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
        /** Photo of the chosen variant (colour), so the cart line shows it instead
         *  of the product's default primary image. Falls back to the primary. */
        variantImage?: string | null;
        giftCardSelected?: boolean;
        customName?: string | null;
        message?: string | null;
        cashArrangement?: CartLineCashArrangement | null;
      }>
    ) {
      const { product, quantity = 1, selectedOptions, variantImage, giftCardSelected, customName, message } = action.payload;
      const resolvedImage = variantImage ?? product.images[0]?.url;
      const cashArrangement = normalizeLineCash(action.payload.cashArrangement);
      // Priced variants (e.g. Size: Small/Medium/Large) each have their own price —
      // resolve the one the shopper actually picked instead of the product's base
      // price, which only mirrors the DEFAULT variant. This is the guest-cart path
      // (no server round-trip), so it must resolve this itself; the signed-in path
      // gets it authoritatively from the server's own cart response.
      const variant = resolveVariantForSelection(product, selectedOptions);
      const basePrice = variant ? effectiveVariantPrice(variant) : product.price.amount;
      // Line identity = variant (colour/size) + personalized custom name + gift-card message
      // + per-unit cash arrangement. Merge only into a line with the SAME config; any
      // difference becomes its own line (Amazon/Shopify-style), so a customer can buy the same
      // product with 3 different cash amounts as 3 lines. Gift-card message is folded only for
      // gift-card products (mirrors the backend gate).
      const variantKey = lineVariantKey(
        selectedOptions,
        customName,
        giftCardSelected,
        product.giftCardEnabled ? message : null,
        cashArrangement
      );
      const existing = state.items.find(
        (i) => i.productId === product.id && i.variantKey === variantKey
      );
      if (existing) {
        existing.quantity += quantity;
        if (variantImage !== undefined) existing.imageUrl = resolvedImage ?? existing.imageUrl;
        if (giftCardSelected !== undefined) existing.giftCardSelected = giftCardSelected;
        if (customName !== undefined) existing.customName = customName;
        if (message !== undefined) existing.message = message;
        existing.cashArrangement = cashArrangement;
        existing.deliveryLeadDays = product.deliveryLeadDays;
        existing.unitPrice =
          basePrice + optionExtraCharge(product, existing.giftCardSelected, existing.customName);
        return;
      }
      state.items.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: resolvedImage,
        unitPrice: basePrice + optionExtraCharge(product, giftCardSelected, customName),
        currency: product.price.currency,
        quantity,
        selectedOptions: selectedOptions ?? null,
        variantKey,
        giftCardSelected: giftCardSelected ?? false,
        customName: customName ?? null,
        message: message ?? null,
        cashArrangement,
        deliveryLeadDays: product.deliveryLeadDays,
      });
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number; variantKey?: string }>
    ) {
      const { productId, quantity, variantKey } = action.payload;
      // Match the exact variant line when a key is given; else (legacy caller)
      // the first line for the product.
      const matches = (i: CartItem) =>
        i.productId === productId && (variantKey === undefined || i.variantKey === variantKey);
      if (quantity <= 0) {
        state.items = state.items.filter((i) => !matches(i));
        return;
      }
      const item = state.items.find(matches);
      if (item) item.quantity = quantity;
    },
    removeItem(state, action: PayloadAction<{ productId: string; variantKey?: string }>) {
      const { productId, variantKey } = action.payload;
      state.items = state.items.filter(
        (i) =>
          !(i.productId === productId && (variantKey === undefined || i.variantKey === variantKey))
      );
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
