"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppStore, useAppSelector } from "@/store";
import { setLocationFromStorage, setLocation, setActiveRegions } from "@/store/slices/location.slice";
import type { LocationState } from "@/store/slices/location.slice";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { writeRegionCookie, writeZoneCookie } from "@/features/location/region";
import { deriveActiveRegions } from "@/features/location/activeRegions";
import { regionsApi } from "@/features/regions/api/regions.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";

/**
 * Hydrates the location slice from localStorage on mount and writes future
 * changes back. Same pattern as `CartPersistence` / `WishlistPersistence`.
 *
 * The default state is UAE (the boutique's home market). Once the user picks
 * explicitly via `LocationSheet`, `hasChosen` flips to `true` and we remember
 * it so we never override their choice on reload.
 */
export function LocationPersistence() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const router = useRouter();
  const hydrated = useRef(false);
  const seededUserId = useRef<string | null>(null);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = storage.get<Partial<LocationState>>(STORAGE_KEYS.location);
    // The `/:region/:locale` URL is now the source of truth for the REGION
    // (`country`): it's seeded into Redux server-side (StoreProvider, from the
    // URL slug) and kept in sync on navigation by RegionLocaleSync. So
    // localStorage restores ONLY the delivery city/zone and the "has chosen"
    // flag here — never the country — otherwise a shared link to another region
    // (or an hreflang alternate) would get silently overridden by a past choice.
    if (stored && stored.hasChosen) {
      dispatch(
        setLocationFromStorage({ city: stored.city, hasChosen: stored.hasChosen })
      );
    }
    // Mirror the URL-seeded region + restored zone into the cookies so SSR
    // catalog fetches and the axios X-Region interceptor agree on the same region.
    writeRegionCookie(store.getState().location.country);
    writeZoneCookie(store.getState().location.city);
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

    (async () => {
      try {
        const regions = await regionsApi.list();
        // Validate the stored region code against the live list — a saved
        // profile value could predate a region being renamed/removed.
        const region = regions.find((r) => r.code === rawCountry);
        if (!region) return;

        // Region is URL-driven now, so only adopt the profile's saved delivery
        // city when it belongs to the region the visitor is currently viewing —
        // we never switch their region out from under the URL they're on.
        const currentCountry = store.getState().location.country;
        if (region.code !== currentCountry) return;

        const zones = await deliveryZonesApi.list(region.code).catch(() => []);
        const city = zones.some((z) => z.name === rawCity) ? rawCity : zones[0]?.name ?? "";

        dispatch(setLocation({ country: region.code, city }));
      } catch {
        // Network hiccup — leave the default location in place.
      }
    })();
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
      writeRegionCookie(loc.country);
      writeZoneCookie(loc.city);
    });
    return unsubscribe;
  }, [store]);

  // Re-validates the active-region set whenever the tab regains focus, so a
  // visitor whose region got hidden by an admin while their tab sat in the
  // background is silently corrected without needing a fresh navigation.
  // Deliberately NOT run on mount: the root layout already seeds fresh
  // activeRegions from SSR on every full page load (see StoreProvider), so a
  // mount-time re-fetch here would just repeat that same request on every
  // single page view for a condition that's rare (an admin hiding a region).
  useEffect(() => {
    async function refresh() {
      try {
        const apiRegions = await regionsApi.list();
        const { activeRegions, defaultCountry } = deriveActiveRegions(apiRegions);
        const wasValid = activeRegions.includes(store.getState().location.country);
        dispatch(setActiveRegions({ activeRegions, defaultCountry }));
        if (!wasValid) {
          // Re-run Server Components so SSR-sourced content (catalog, footer,
          // currency) reflects the corrected region too, not just the client store.
          router.refresh();
        }
      } catch {
        // Network hiccup — keep the last-known active regions, try again on next focus.
      }
    }
    function onVisibilityChange() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [dispatch, store, router]);

  return null;
}
