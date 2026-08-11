"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useAppStore } from "@/store";
import { parsePrefix } from "@/features/location/routing";
import { geoApi } from "@/features/location/api/geo.api";
import { LocationSheet } from "./LocationSheet";

/**
 * Mounts invisibly in the storefront layout and auto-opens the location picker
 * on a visitor's first session, pre-selecting the region we detect from their
 * IP country (never a hard switch — they confirm by picking a zone / Save).
 *
 * Edge cases handled:
 * - Reads localStorage at mount to skip the modal for returning visitors.
 * - Re-checks Redux state at fire time: AuthHydrator's profile fetch may have
 *   seeded the location (via LocationPersistence) in the window between mount
 *   and timer fire — no double-prompt for logged-in returning users.
 * - Subscribes to the store while open: if DeliverToPill or profile seeding
 *   sets hasChosen while the modal is visible, it auto-dismisses.
 * - Only auto-opens on the REGION HOME (e.g. `/ae/en`). The URL is region-
 *   prefixed now (an edge redirect sends bare `/` → `/:region/:locale`), so the
 *   page is detected via `parsePrefix().rest === "/"`, not a bare `"/"`. Deep-
 *   link visitors (e.g. `/ae/en/shop`) keep the default region and can switch
 *   via the "Deliver to" pill — the full-screen backdrop must not block filters.
 */
export function LocationOnboarding() {
  const [open, setOpen] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const checked = useRef(false);
  const store = useAppStore();
  const pathname = usePathname();

  useEffect(() => {
    if (checked.current) return;
    // Gate the first-visit prompt to the region home only (see note above).
    const parsed = pathname ? parsePrefix(pathname) : null;
    const isRegionHome = !!parsed && parsed.rest === "/";
    if (!isRegionHome) return;
    checked.current = true;

    const stored = storage.get<{ hasChosen?: boolean }>(STORAGE_KEYS.location);
    if (stored?.hasChosen) return;

    // Country-only IP hint to pre-select the region. Best-effort: a failure or a
    // country with no configured region just leaves the default selected.
    let cancelled = false;
    geoApi
      .detect()
      .then((r) => {
        if (!cancelled && r?.regionCode) setDetectedRegion(r.regionCode);
      })
      .catch(() => {});

    // Small delay lets AuthHydrator seed a returning user's saved location (and
    // gives the geo hint time to resolve) before we decide to prompt.
    const id = setTimeout(() => {
      if (!store.getState().location.hasChosen) setOpen(true);
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [store, pathname]);

  // While the modal is visible, watch for anything that sets hasChosen
  // (profile-seeded auth, user picking via DeliverToPill, etc.) and dismiss.
  useEffect(() => {
    if (!open) return;
    const unsub = store.subscribe(() => {
      if (store.getState().location.hasChosen) setOpen(false);
    });
    return unsub;
  }, [open, store]);

  return (
    <LocationSheet
      open={open}
      onClose={() => setOpen(false)}
      initialRegion={detectedRegion}
    />
  );
}
