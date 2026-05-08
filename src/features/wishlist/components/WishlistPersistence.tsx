"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store";
import {
  setWishlistItems,
  type WishlistItem,
} from "@/store/slices/wishlist.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Mirrors `CartPersistence` for the wishlist slice — the wishlist is local-
 * only (matching the mobile app per spec §3.16) so localStorage is the
 * authoritative store. Mount once at the storefront layout.
 */
export function WishlistPersistence() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const hydrated = useRef(false);
  const initialItems = useAppSelector((s) => s.wishlist.items);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = storage.get<WishlistItem[]>(STORAGE_KEYS.wishlist);
    if (
      initialItems.length === 0 &&
      stored &&
      Array.isArray(stored) &&
      stored.length > 0
    ) {
      dispatch(setWishlistItems(stored));
    }
  }, [dispatch, initialItems.length]);

  useEffect(() => {
    let lastSerialised: string | null = null;
    const unsubscribe = store.subscribe(() => {
      if (!hydrated.current) return;
      const items = store.getState().wishlist.items;
      const next = JSON.stringify(items);
      if (next === lastSerialised) return;
      lastSerialised = next;
      if (items.length === 0) {
        storage.remove(STORAGE_KEYS.wishlist);
      } else {
        storage.set(STORAGE_KEYS.wishlist, items);
      }
    });
    return unsubscribe;
  }, [store]);

  return null;
}
