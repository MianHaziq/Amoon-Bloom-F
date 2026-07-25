"use client";

import { usePublicVat } from "./usePublicVat";

/**
 * True when the current region's VAT is enabled AND baked into catalogue prices
 * (inclusive) — the one condition under which a "VAT Inclusive" label should be
 * shown next to a price. Shared by the PDP price block and shop grid cards so
 * both read the same region-wide public config.
 */
export function useShowVatInclusive(): boolean {
  const config = usePublicVat();
  return Boolean(config?.enabled && config?.inclusive);
}
