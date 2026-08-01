import type { ApiPublicVatConfig } from "./types";

/**
 * What VAT hint (if any) applies BEFORE checkout, where we only know the
 * region's public config, not the resolved per-order tax. Callers decide
 * which kind(s) to actually render for their surface — the PDP only shows
 * "inclusive", the shop grid only shows "exclusive", cart/drawer show
 * neither, checkout computes its own exact figures.
 *
 *   • "inclusive"  → the price already contains VAT; show the plain
 *     "VAT Inclusive" text (never an amount — that only confuses).
 *   • "exclusive"  → VAT is added on top at checkout; the rate isn't quoted
 *     pre-checkout (only "+ VAT", no percentage). Only surfaced when the
 *     scope is ALL_PRODUCTS, because for SPECIFIC_* scopes we can't know
 *     from the public config whether THIS product is taxable — so we say
 *     nothing rather than risk a wrong hint.
 *   • null          → VAT disabled/zero, or an exclusive SPECIFIC_* scope we
 *     can't safely preview.
 */
export type VatHint =
  | { kind: "inclusive" }
  | { kind: "exclusive"; rate: number }
  | null;

export function vatHint(config: ApiPublicVatConfig | undefined | null): VatHint {
  if (!config || !config.enabled || !(config.ratePercent > 0)) return null;
  // Inclusive is announced region-wide (matches the existing PDP badge), even
  // for SPECIFIC_* scopes — it never quotes a per-product figure, only a label.
  if (config.inclusive) return { kind: "inclusive" };
  if (config.appliesTo === "ALL_PRODUCTS") {
    return { kind: "exclusive", rate: config.ratePercent };
  }
  return null;
}
