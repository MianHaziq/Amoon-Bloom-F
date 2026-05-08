"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR and on the very first client render, then `true`
 * once React has hydrated. Use this instead of the `useState(false) +
 * useEffect(setTrue)` pattern — it avoids the cascading render that the
 * `react-hooks/set-state-in-effect` rule (rightfully) flags.
 */
const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
