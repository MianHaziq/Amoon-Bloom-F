import type { ApiPublicVatConfig } from "./types";

/**
 * What VAT hint (if any) to show next to a price BEFORE checkout — on the
 * product page and cart, where we only know the region's public config, not
 * the resolved per-order tax.
 *
 *   • "inclusive"  → the price already contains VAT; show the plain
 *     "VAT Inclusive" text (never an amount — that only confuses).
 *   • "exclusive"  → VAT is added on top at checkout; show "+ {rate}% VAT".
 *     Only surfaced when the scope is ALL_PRODUCTS, because for SPECIFIC_*
 *     scopes we can't know from the public config whether THIS product is
 *     taxable — so we say nothing rather than risk a wrong "+X% VAT".
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
