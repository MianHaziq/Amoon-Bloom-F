import type { AppThunk } from "@/store";
import {
  addItem,
  updateQuantity,
  splitCashLine,
  removeItem,
  clearCart,
  setItems,
  type CartItem,
  type CartLineCashArrangement,
} from "@/store/slices/cart.slice";
import { pushToast } from "@/store/slices/ui.slice";
import { ApiError } from "@/services/http";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { Product } from "@/features/products/types";
import { cartApi } from "./api/cart.api";
import { apiCartToCartItems } from "./adapters";

/** Result every cart mutation resolves to, so callers can gate success UI. */
export interface CartMutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Cart mutations as auth-aware thunks.
 *
 * Strategy (keeps the "instant UX" cart while making the server cart the source
 * of truth for signed-in users):
 *   • Every mutation updates Redux OPTIMISTICALLY first, so the UI never waits.
 *   • Guests: local Redux only (persisted to localStorage by CartSync).
 *   • Authenticated: the same call is mirrored to `/cart`, and Redux is then
 *     reconciled to the server's authoritative response (handles stock caps,
 *     effective/discount pricing, etc.). On failure we re-pull the server cart
 *     so the UI can't drift from the backend.
 *
 * All components should dispatch these (via `useCart`) rather than the raw slice
 * actions, so server sync happens no matter where the mutation originates.
 */

function isAuthed(getState: () => { auth: { status: string } }): boolean {
  return getState().auth.status === "authenticated";
}

async function reconcile(dispatch: (a: unknown) => void) {
  try {
    const server = await cartApi.get();
    dispatch(setItems(apiCartToCartItems(server)));
  } catch {
    // Network/auth hiccup — leave the optimistic state in place.
  }
}

/**
 * Shared handler for a failed server mutation: pull the backend's message
 * (e.g. "Only 3 in stock"), roll the optimistic change back to the server's
 * truth, and surface the reason as an error toast so the revert isn't silent.
 */
async function handleServerError(
  dispatch: (a: unknown) => void,
  err: unknown
): Promise<CartMutationResult> {
  const error =
    err instanceof ApiError ? err.message : "Couldn't update your cart. Please try again.";
  await reconcile(dispatch);
  dispatch(pushToast({ title: error, variant: "error" }));
  return { ok: false, error };
}

export interface CartExtras {
  giftCardSelected?: boolean;
  customName?: string | null;
  /** Gift-card personalized message. Reuses the cart's existing message field. */
  message?: string | null;
  /** Per-unit cash arrangement for this line (null = none). Part of line identity. */
  cashArrangement?: CartLineCashArrangement | null;
  /** Photo of the chosen variant, for the optimistic/guest local cart line. The
   *  server derives its own on reconcile, so this isn't sent to the API. */
  variantImage?: string | null;
}

export const addToCart =
  (
    product: Product,
    quantity = 1,
    selectedOptions?: Record<string, string> | null,
    extras?: CartExtras
  ): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(
      addItem({
        product,
        quantity,
        selectedOptions,
        variantImage: extras?.variantImage,
        giftCardSelected: extras?.giftCardSelected,
        customName: extras?.customName,
        message: extras?.message,
        cashArrangement: extras?.cashArrangement,
      })
    );
    if (!isAuthed(getState)) return { ok: true };
    try {
      const server = await cartApi.add({
        productId: product.id,
        quantity,
        selectedOptions,
        giftCardSelected: extras?.giftCardSelected,
        customName: extras?.customName,
        message: extras?.message,
        cashArrangement: extras?.cashArrangement,
      });
      dispatch(setItems(apiCartToCartItems(server)));
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

export const setCartQuantity =
  (productId: string, quantity: number, variantKey?: string): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(updateQuantity({ productId, quantity, variantKey }));
    if (!isAuthed(getState)) return { ok: true };
    try {
      // Server treats quantity <= 0 as a remove. variantKey targets the exact line.
      const server =
        quantity <= 0
          ? await cartApi.removeItem(productId, variantKey)
          : await cartApi.setQuantity({ productId, quantity, variantKey });
      dispatch(setItems(apiCartToCartItems(server)));
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

/** Structurally matches CashArrangementModal's CashUnitEntry — kept independent here
 *  rather than importing that (product-feature UI component) type into this
 *  cart-domain file. */
export interface CashEntryLike {
  included: boolean;
  cashAmount: string;
  denomination: number | null;
  note: string;
}

function cashArrangementEquals(
  a: CartLineCashArrangement | null,
  b: CartLineCashArrangement | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.cashAmount === b.cashAmount && a.denomination === b.denomination && a.note === b.note;
}

/**
 * Applies a freshly re-collected set of per-unit cash-arrangement entries back onto
 * an existing line — used when the shopper raises a cash-carrying line's quantity in
 * the cart drawer/page and re-opens CashArrangementModal to configure the new unit(s).
 *
 * If every unit still shares the SAME config the line already had, this is just a
 * quantity bump (setCartQuantity). If units now diverge (a different amount, or none
 * for the new unit(s)), the line is split: removed, then one line per distinct group is
 * (re-)added — the cart-drawer equivalent of the product page's multi-unit "Add to
 * cart" grouping (see AddToCartPanel.handleAdd).
 */
export const applyCashArrangementEntries =
  (
    productId: string,
    variantKey: string,
    entries: CashEntryLike[]
  ): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    const original = getState().cart.items.find(
      (i) => i.productId === productId && i.variantKey === variantKey
    );
    if (!original) return { ok: true };

    const groups = new Map<
      string,
      { cashArrangement: CartLineCashArrangement | null; quantity: number }
    >();
    for (const e of entries) {
      const amt = e.included ? Number(e.cashAmount) : 0;
      const cash: CartLineCashArrangement | null =
        amt > 0
          ? { cashAmount: Math.round(amt * 100) / 100, denomination: e.denomination ?? null, note: (e.note ?? "").trim() }
          : null;
      const key = cash ? JSON.stringify([cash.cashAmount, cash.denomination, cash.note]) : "none";
      const g = groups.get(key);
      if (g) g.quantity += 1;
      else groups.set(key, { cashArrangement: cash, quantity: 1 });
    }
    const groupList = Array.from(groups.values());

    // Fast path — every unit ended up with the line's ORIGINAL shared config: no
    // divergence, so this is just a quantity change.
    if (
      groupList.length === 1 &&
      cashArrangementEquals(groupList[0].cashArrangement, original.cashArrangement ?? null)
    ) {
      return dispatch(setCartQuantity(productId, groupList[0].quantity, variantKey));
    }

    dispatch(splitCashLine({ productId, variantKey, groups: groupList }));
    if (!isAuthed(getState)) return { ok: true };
    try {
      // No server endpoint edits a line's cash config in place — remove the old line,
      // then re-add each resulting group (server-side variantKey grouping handles
      // merges/creates the same way PDP's sequential per-group add() does).
      await cartApi.removeItem(productId, variantKey);
      let server: Awaited<ReturnType<typeof cartApi.add>> | null = null;
      for (const g of groupList) {
        if (g.quantity <= 0) continue;
        server = await cartApi.add({
          productId,
          quantity: g.quantity,
          selectedOptions: original.selectedOptions,
          giftCardSelected: original.giftCardSelected,
          customName: original.customName,
          message: original.message,
          cashArrangement: g.cashArrangement,
        });
      }
      if (server) dispatch(setItems(apiCartToCartItems(server)));
      else await reconcile(dispatch);
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

export const removeFromCart =
  (productId: string, variantKey?: string): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(removeItem({ productId, variantKey }));
    if (!isAuthed(getState)) return { ok: true };
    try {
      const server = await cartApi.removeItem(productId, variantKey);
      dispatch(setItems(apiCartToCartItems(server)));
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

export const emptyCart = (): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(clearCart());
    if (!isAuthed(getState)) return { ok: true };
    try {
      await cartApi.clear();
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

// Dedupes concurrent hydrateServerCart calls (e.g. React Strict Mode
// double-invoking CartSync's effect in dev, or a rapid re-auth) — without
// this, two overlapping calls both read the same non-empty guest cart before
// either clears localStorage, and both re-POST every item, doubling
// quantities server-side. Module-level (not per-thunk-call) so it's shared
// across every dispatch.
let hydrateInFlight: Promise<void> | null = null;

/**
 * On sign-in (or a reload while signed-in): merge any leftover guest cart into
 * the server, drop the guest localStorage copy, then load the authoritative
 * server cart into Redux. Safe to call repeatedly — once the guest copy is
 * cleared, subsequent calls just re-hydrate from the server.
 */
export const hydrateServerCart = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  if (!isAuthed(getState)) return;
  if (hydrateInFlight) return hydrateInFlight;

  hydrateInFlight = (async () => {
    try {
      const guest = storage.get<CartItem[]>(STORAGE_KEYS.cart);
      if (Array.isArray(guest) && guest.length > 0) {
        // First item runs alone so the server-side cart row (unique per user)
        // is guaranteed to exist before the rest fire concurrently — otherwise
        // a brand-new user's first-ever sync could race N parallel "create
        // cart" attempts against that unique constraint.
        // Carry the full per-line detail across the merge — not just
        // productId/quantity — so a guest's chosen variant, gift-card/custom-name
        // add-ons and message survive sign-in instead of being silently dropped.
        const mergePayload = (it: CartItem) => ({
          productId: it.productId,
          quantity: it.quantity,
          selectedOptions: it.selectedOptions,
          giftCardSelected: it.giftCardSelected,
          customName: it.customName,
          message: it.message,
          cashArrangement: it.cashArrangement,
        });
        const [first, ...rest] = guest;
        await cartApi.add(mergePayload(first));
        await Promise.all(rest.map((it) => cartApi.add(mergePayload(it))));
        storage.remove(STORAGE_KEYS.cart);
      }
      const server = await cartApi.get();
      dispatch(setItems(apiCartToCartItems(server)));
    } catch {
      // Offline / transient — keep whatever is already in Redux.
    } finally {
      hydrateInFlight = null;
    }
  })();
  return hydrateInFlight;
};
