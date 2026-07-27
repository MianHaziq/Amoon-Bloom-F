"use client";

import { usePublicVat } from "./usePublicVat";
import { useIsHydrated } from "@/hooks/useIsHydrated";

/**
 * True when the current region's VAT is enabled AND baked into catalogue prices
 * (inclusive) — the one condition under which a "VAT Inclusive" label should be
 * shown next to a price. Shared by the PDP price block and shop grid cards so
 * both read the same region-wide public config.
 *
 * Gated on hydration: the VAT config is a client-only query (it is NOT seeded into the
 * SSR dehydrated cache — see app/layout.tsx, which only seeds the regions list). Without
 * the gate the label could render on the client's first paint (from a warm client cache)
 * while the server rendered it absent, tripping React's hydration-mismatch check. Holding
 * it `false` until hydrated keeps server and first-client markup identical; the label then
 * appears once the config resolves (a normal post-hydration update).
 */
export function useShowVatInclusive(): boolean {
  const hydrated = useIsHydrated();
  const config = usePublicVat();
  return hydrated && Boolean(config?.enabled && config?.inclusive);
}
