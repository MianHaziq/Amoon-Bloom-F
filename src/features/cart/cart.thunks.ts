import type { AppThunk } from "@/store";
import {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setItems,
  type CartItem,
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
        giftCardSelected: extras?.giftCardSelected,
        customName: extras?.customName,
        message: extras?.message,
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
      });
      dispatch(setItems(apiCartToCartItems(server)));
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

export const setCartQuantity =
  (productId: string, quantity: number): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(updateQuantity({ productId, quantity }));
    if (!isAuthed(getState)) return { ok: true };
    try {
      // Server treats quantity <= 0 as a remove.
      const server =
        quantity <= 0
          ? await cartApi.removeItem(productId)
          : await cartApi.setQuantity({ productId, quantity });
      dispatch(setItems(apiCartToCartItems(server)));
      return { ok: true };
    } catch (err) {
      return handleServerError(dispatch, err);
    }
  };

export const removeFromCart =
  (productId: string): AppThunk<Promise<CartMutationResult>> =>
  async (dispatch, getState) => {
    dispatch(removeItem(productId));
    if (!isAuthed(getState)) return { ok: true };
    try {
      const server = await cartApi.removeItem(productId);
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

/**
 * On sign-in (or a reload while signed-in): merge any leftover guest cart into
 * the server, drop the guest localStorage copy, then load the authoritative
 * server cart into Redux. Safe to call repeatedly — once the guest copy is
 * cleared, subsequent calls just re-hydrate from the server.
 */
export const hydrateServerCart = (): AppThunk => async (dispatch, getState) => {
  if (!isAuthed(getState)) return;
  try {
    const guest = storage.get<CartItem[]>(STORAGE_KEYS.cart);
    if (Array.isArray(guest) && guest.length > 0) {
      for (const it of guest) {
        await cartApi.add({ productId: it.productId, quantity: it.quantity });
      }
      storage.remove(STORAGE_KEYS.cart);
    }
    const server = await cartApi.get();
    dispatch(setItems(apiCartToCartItems(server)));
  } catch {
    // Offline / transient — keep whatever is already in Redux.
  }
};
