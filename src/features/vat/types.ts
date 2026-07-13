/**
 * VAT types — match `mapVatConfig` / `defaultConfigShape` in
 * Amoonis-Boutique-B/src/services/vat.service.js.
 *
 * VAT is configured PER REGION: one config per Region (e.g. UAE 5%, KSA 15%). A region with
 * no explicit config comes back from the admin endpoints as a disabled default (enabled:
 * false, ratePercent: 0) rather than 404 — there's always something to render/edit.
 */

export type VatAppliesTo = "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS" | "SPECIFIC_CATEGORIES";

/** Full config for ONE region — the admin edit/list shape. */
export interface ApiVatConfig {
  regionId: string;
  regionCode: string | null;
  regionName: string | null;
  enabled: boolean;
  /** Percent, 0–100, e.g. 5 for 5%. */
  ratePercent: number;
  /** True = catalogue prices already include this VAT (nothing added at checkout). */
  inclusive: boolean;
  appliesTo: VatAppliesTo;
  productIds: string[];
  categoryIds: string[];
  /** Null when the region has never been explicitly configured. */
  updatedAt: string | null;
}

/** Partial update payload for `PUT /vat/:regionId`. */
export interface ApiVatConfigUpdateInput {
  enabled?: boolean;
  ratePercent?: number;
  inclusive?: boolean;
  appliesTo?: VatAppliesTo;
  /** Replaces the scope when appliesTo is SPECIFIC_PRODUCTS. Omit to leave unchanged. */
  productIds?: string[];
  /** Replaces the scope when appliesTo is SPECIFIC_CATEGORIES. Omit to leave unchanged. */
  categoryIds?: string[];
}

/** Minimal public shape for the storefront's CURRENT region (`GET /vat/public`). */
export interface ApiPublicVatConfig {
  enabled: boolean;
  ratePercent: number;
  inclusive: boolean;
  appliesTo: VatAppliesTo;
}
