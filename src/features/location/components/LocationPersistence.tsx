"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppStore } from "@/store";
import { setLocationFromStorage } from "@/store/slices/location.slice";
import type { LocationState } from "@/store/slices/location.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Hydrates the location slice from localStorage on mount and writes future
 * changes back. Same pattern as `CartPersistence` / `WishlistPersistence`.
 *
 * The default state is UAE/Dubai (the boutique's home market). Once the user
 * picks explicitly via `LocationSheet`, `hasChosen` flips to `true` and we
 * remember it so we never override their choice on reload.
 */
export function LocationPersistence() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = storage.get<Partial<LocationState>>(STORAGE_KEYS.location);
    if (stored && stored.hasChosen) {
      dispatch(setLocationFromStorage(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    let lastSerialised: string | null = null;
    const unsubscribe = store.subscribe(() => {
      if (!hydrated.current) return;
      const loc = store.getState().location;
      if (!loc.hasChosen) return;
      const next = JSON.stringify(loc);
      if (next === lastSerialised) return;
      lastSerialised = next;
      storage.set(STORAGE_KEYS.location, loc);
    });
    return unsubscribe;
  }, [store]);

  return null;
}
