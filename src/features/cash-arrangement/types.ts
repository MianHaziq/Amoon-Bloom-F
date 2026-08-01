/**
 * Cash arrangement types — match `mapConfig` / `defaultConfigShape` in
 * Amoonis-Boutique-B/src/services/cashArrangement.service.js.
 *
 * Scoped per Region:
 *   - ENABLEMENT: is the "Add cash arrangement" option offered at all, and for which
 *     products/categories (ALL_PRODUCTS / SPECIFIC_PRODUCTS / SPECIFIC_CATEGORIES) — plus
 *     the admin-curated quick-pick cash amounts and banknote denomination presets.
 *   - REGION-WIDE FLAT FEE (feeStepAmount/feeMarginPercent): the base of the fee precedence
 *     chain, set right here. A per-zone flat fee (on the DeliveryZone) beats it, and finer
 *     product/category overrides (edited on the product/category forms) beat those. Full
 *     chain: productZone ?? productRegion ?? product ?? categoryZone ?? categoryRegion ??
 *     category ?? zoneFlat ?? regionFlat. `ApiCashArrangementResolveResult` below is the
 *     RESOLVED result of that chain for a specific cart, not something admins edit directly.
 */

export type CashArrangementAppliesTo =
  | "ALL_PRODUCTS"
  | "SPECIFIC_PRODUCTS"
  | "SPECIFIC_CATEGORIES";

/** Full enablement config for ONE region — the admin edit/list shape. */
export interface ApiCashArrangementConfig {
  regionId: string;
  regionCode: string | null;
  regionName: string | null;
  enabled: boolean;
  appliesTo: CashArrangementAppliesTo;
  productIds: string[];
  categoryIds: string[];
  quickPickAmounts: number[];
  denominations: number[];
  /** Region-wide FLAT fee schedule (both-or-neither). null = no region-wide fee. */
  feeStepAmount: number | null;
  feeMarginPercent: number | null;
  /** Null when the region has never been explicitly configured. */
  updatedAt: string | null;
}

/** Partial update payload for `PUT /cash-arrangement/:regionId`. */
export interface ApiCashArrangementConfigUpdateInput {
  enabled?: boolean;
  appliesTo?: CashArrangementAppliesTo;
  /** Replaces the scope when appliesTo is SPECIFIC_PRODUCTS. Omit to leave unchanged. */
  productIds?: string[];
  /** Replaces the scope when appliesTo is SPECIFIC_CATEGORIES. Omit to leave unchanged. */
  categoryIds?: string[];
  quickPickAmounts?: number[];
  denominations?: number[];
  /** Region-wide flat fee (both-or-neither). Send both null to clear it. Omit to leave unchanged. */
  feeStepAmount?: number | null;
  feeMarginPercent?: number | null;
}

/** Minimal public shape for the storefront's CURRENT region (`GET /cash-arrangement/public`) —
 *  enablement only, no cart/fee awareness. */
export interface ApiPublicCashArrangementConfig {
  enabled: boolean;
  appliesTo: CashArrangementAppliesTo;
  quickPickAmounts: number[];
  denominations: number[];
}

/** Body for `POST /cash-arrangement/resolve`. Omit `cartLines` to fall back to the
 *  signed-in user's stored cart (mirrors `POST /promo-codes/validate`). */
export interface ApiCashArrangementResolveInput {
  zoneId?: string;
  cartLines?: Array<{ productId: string }>;
}

/** Per-line schedule in a resolve result (cash arrangement is per line). */
export interface ApiCashArrangementResolveLine {
  productId: string;
  eligible: boolean;
  feeStepAmount: number | null;
  feeMarginPercent: number | null;
}

/** Cart/zone-aware resolve result. `eligible`/`feeStepAmount`/`feeMarginPercent` are the
 *  aggregate (first eligible line) used by the single-product PDP; `lines` gives each
 *  distinct product's own schedule so checkout can price every per-line cash arrangement. */
export interface ApiCashArrangementResolveResult {
  eligible: boolean;
  feeStepAmount: number | null;
  feeMarginPercent: number | null;
  quickPickAmounts: number[];
  denominations: number[];
  lines?: ApiCashArrangementResolveLine[];
}
