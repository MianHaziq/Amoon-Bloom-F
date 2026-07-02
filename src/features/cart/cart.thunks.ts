import type { AppThunk } from "@/store";
import {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setItems,
  type CartItem,
} from "@/store/slices/cart.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { Product } from "@/features/products/types";
import { cartApi } from "./api/cart.api";
import { apiCartToCartItems } from "./adapters";

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

export const addToCart =
  (product: Product, quantity = 1): AppThunk =>
  async (dispatch, getState) => {
    dispatch(addItem({ product, quantity }));
    if (!isAuthed(getState)) return;
    try {
      const server = await cartApi.add({ productId: product.id, quantity });
      dispatch(setItems(apiCartToCartItems(server)));
    } catch {
      await reconcile(dispatch);
    }
  };

export const setCartQuantity =
  (productId: string, quantity: number): AppThunk =>
  async (dispatch, getState) => {
    dispatch(updateQuantity({ productId, quantity }));
    if (!isAuthed(getState)) return;
    try {
      // Server treats quantity <= 0 as a remove.
      const server =
        quantity <= 0
          ? await cartApi.removeItem(productId)
          : await cartApi.setQuantity({ productId, quantity });
      dispatch(setItems(apiCartToCartItems(server)));
    } catch {
      await reconcile(dispatch);
    }
  };

export const removeFromCart =
  (productId: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(removeItem(productId));
    if (!isAuthed(getState)) return;
    try {
      const server = await cartApi.removeItem(productId);
      dispatch(setItems(apiCartToCartItems(server)));
    } catch {
      await reconcile(dispatch);
    }
  };

export const emptyCart = (): AppThunk => async (dispatch, getState) => {
  dispatch(clearCart());
  if (!isAuthed(getState)) return;
  try {
    await cartApi.clear();
  } catch {
    await reconcile(dispatch);
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
