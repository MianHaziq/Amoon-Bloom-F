"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store";
import { setItems, type CartItem } from "@/store/slices/cart.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Bridges the cart slice to localStorage so a guest's bag survives a refresh
 * and persists until they sign in (the checkout flow then syncs to the
 * server cart). Mount once at the storefront layout root. Renders nothing.
 *
 * The hydration runs once on mount; after that we subscribe to the store
 * directly (instead of reacting to a selector) so we don't have to re-render
 * whenever cart state changes.
 */
export function CartPersistence() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const hydrated = useRef(false);
  const initialItems = useAppSelector((s) => s.cart.items);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = storage.get<CartItem[]>(STORAGE_KEYS.cart);
    // If redux already has items (set during this session before mount)
    // prefer those; otherwise hydrate from storage.
    if (initialItems.length === 0 && stored && Array.isArray(stored) && stored.length > 0) {
      dispatch(setItems(stored));
    }
  }, [dispatch, initialItems.length]);

  useEffect(() => {
    let lastSerialised: string | null = null;
    const unsubscribe = store.subscribe(() => {
      if (!hydrated.current) return;
      const items = store.getState().cart.items;
      const next = JSON.stringify(items);
      if (next === lastSerialised) return;
      lastSerialised = next;
      if (items.length === 0) {
        storage.remove(STORAGE_KEYS.cart);
      } else {
        storage.set(STORAGE_KEYS.cart, items);
      }
    });
    return unsubscribe;
  }, [store]);

  return null;
}
