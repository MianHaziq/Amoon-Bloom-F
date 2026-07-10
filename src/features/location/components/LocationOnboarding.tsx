"use client";

import { useEffect, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useAppStore } from "@/store";
import { LocationSheet } from "./LocationSheet";

/**
 * Mounts invisibly in the storefront layout and auto-opens the location picker
 * on a visitor's first session.
 *
 * Edge cases handled:
 * - Reads localStorage at mount to skip the modal for returning visitors.
 * - Re-checks Redux state at fire time: AuthHydrator's profile fetch may have
 *   seeded the location (via LocationPersistence) in the ~700ms window between
 *   mount and timer fire — no double-prompt for logged-in returning users.
 * - Subscribes to the store while open: if DeliverToPill or profile seeding
 *   sets hasChosen while the modal is visible, it auto-dismisses.
 */
export function LocationOnboarding() {
  const [open, setOpen] = useState(false);
  const checked = useRef(false);
  const store = useAppStore();

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const stored = storage.get<{ hasChosen?: boolean }>(STORAGE_KEYS.location);
    if (stored?.hasChosen) return;

    const id = setTimeout(() => {
      if (!store.getState().location.hasChosen) {
        setOpen(true);
      }
    }, 700);
    return () => clearTimeout(id);
  }, [store]);

  // While the modal is visible, watch for anything that sets hasChosen
  // (profile-seeded auth, user picking via DeliverToPill, etc.) and dismiss.
  useEffect(() => {
    if (!open) return;
    const unsub = store.subscribe(() => {
      if (store.getState().location.hasChosen) setOpen(false);
    });
    return unsub;
  }, [open, store]);

  return <LocationSheet open={open} onClose={() => setOpen(false)} />;
}
