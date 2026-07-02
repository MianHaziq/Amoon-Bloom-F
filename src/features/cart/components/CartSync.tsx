"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearCart } from "@/store/slices/cart.slice";
import { hydrateServerCart } from "@/features/cart/cart.thunks";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Bridges the local (guest) cart and the server cart around auth transitions.
 * Mount once at the storefront layout root; renders nothing.
 *
 *   • Sign in (or reload while signed in): merge any leftover guest cart into
 *     the server, then hydrate Redux from the authoritative server cart.
 *   • Sign out: clear the local mirror (and its localStorage copy) so the next
 *     guest doesn't see the previous user's bag. The server cart is untouched
 *     and returns on next sign-in.
 *
 * Guest-mode localStorage persistence lives in CartPersistence; the two are
 * complementary (that one no-ops while authenticated).
 */
export function CartSync() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = status;

    if (status === "authenticated") {
      // Runs on the guest→auth transition AND on a reload that boots straight
      // into authenticated; hydrateServerCart is idempotent either way.
      dispatch(hydrateServerCart());
    } else if (prev === "authenticated" && status !== "loading") {
      // Genuine sign-out (authenticated → idle/error), not the initial idle.
      dispatch(clearCart());
      storage.remove(STORAGE_KEYS.cart);
    }
  }, [status, dispatch]);

  return null;
}
