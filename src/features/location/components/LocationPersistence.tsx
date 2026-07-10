"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppStore, useAppSelector } from "@/store";
import { setLocationFromStorage, setLocation } from "@/store/slices/location.slice";
import type { LocationState } from "@/store/slices/location.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { regionCodeForCountry, writeRegionCookie } from "@/features/location/region";
import { COUNTRIES, type CountryCode } from "@/features/location/data";

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
  const seededUserId = useRef<string | null>(null);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = storage.get<Partial<LocationState>>(STORAGE_KEYS.location);
    if (stored && stored.hasChosen) {
      dispatch(setLocationFromStorage(stored));
    }
    // Mirror the (possibly default) region into the cookie so SSR catalog
    // fetches and the axios X-Region interceptor agree on the same region.
    writeRegionCookie(regionCodeForCountry(store.getState().location.country));
  }, [dispatch, store]);

  // When a user logs in (or the page loads with an active session), seed the
  // location from their saved profile if they haven't explicitly chosen one yet.
  useEffect(() => {
    if (!user) {
      seededUserId.current = null;
      return;
    }
    if (seededUserId.current === user.id) return;
    seededUserId.current = user.id;

    if (store.getState().location.hasChosen) return;

    const rawCountry = user.addressCountry;
    const rawCity = user.addressCity;
    if (!rawCountry || !rawCity) return;

    // Validate the stored country code against the known list (getCountry() falls
    // back silently instead of throwing, so an explicit find is the safe check).
    const countryDef = COUNTRIES.find((c) => c.code === rawCountry);
    if (!countryDef) return;

    // Validate the stored city; fall back to the country's default if mismatched.
    const city = (countryDef.cities as readonly string[]).includes(rawCity)
      ? rawCity
      : countryDef.defaultCity;

    dispatch(setLocation({ country: countryDef.code as CountryCode, city }));
  }, [user, dispatch, store]);

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
      writeRegionCookie(regionCodeForCountry(loc.country));
    });
    return unsubscribe;
  }, [store]);

  return null;
}
