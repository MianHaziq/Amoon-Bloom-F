import { addDays } from "@/lib/format";
import type { ApiOrder, DeliveryType } from "./types";

/**
 * The whole order's delivery lead time = the LONGEST per-line resolved lead time across
 * its items (a 2-day item makes the whole order 2 days, even next to 1-day items).
 * Returns 0 when no line carries a lead time.
 */
export function maxResolvedLeadDays(
  items: ReadonlyArray<{ resolvedLeadDays?: number | null }> | null | undefined
): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return Math.max(0, ...items.map((i) => i.resolvedLeadDays ?? 0));
}

export interface OrderDeliveryView {
  deliveryType: DeliveryType;
  isScheduled: boolean;
  /** Effective whole-order lead time in days, or null when unknown (legacy orders). */
  effectiveLeadDays: number | null;
  /** Standard estimated arrival: createdAt + effective lead days. Null when unknown. */
  expectedDate: Date | null;
  /** The future date the customer reserved — only for scheduled orders. */
  reservedDate: Date | null;
  /** Committed delivery date: the reserved date when scheduled, else the expected date. */
  finalDate: Date | null;
}

type DeliveryOrderInput = Pick<
  ApiOrder,
  | "deliveryType"
  | "scheduledDeliveryAt"
  | "estimatedDeliveryDays"
  | "estimatedDeliveryDate"
  | "createdAt"
  | "items"
>;

/**
 * Single source of truth for the customer-/admin-facing delivery dates, so every surface
 * (order detail, thank-you page, admin, email) shows identical values.
 *
 * `expectedDate` uses the exact `estimatedDeliveryDays` snapshot for STANDARD orders; for
 * SCHEDULED orders that snapshot is null, so it falls back to the slowest line's resolved
 * lead days (the "product delivery date"). `finalDate` is the reserved date when the
 * customer scheduled one, otherwise the standard expected arrival.
 */
export function getOrderDeliveryView(order: DeliveryOrderInput): OrderDeliveryView {
  const isScheduled =
    order.deliveryType === "SCHEDULED" && !!order.scheduledDeliveryAt;

  const effectiveLeadDays =
    order.estimatedDeliveryDays != null
      ? order.estimatedDeliveryDays
      : maxResolvedLeadDays(order.items) || null;

  // Prefer the concrete arrival-date snapshot (region-tz "YYYY-MM-DD") — pinned to noon UTC
  // so formatting in any viewer timezone keeps the same calendar day (no ±1-day drift). Only
  // legacy orders without the snapshot fall back to createdAt + lead-days (which can drift).
  const expectedDate = order.estimatedDeliveryDate
    ? new Date(`${order.estimatedDeliveryDate}T12:00:00Z`)
    : effectiveLeadDays != null
      ? addDays(order.createdAt, effectiveLeadDays)
      : null;
  const reservedDate = isScheduled
    ? new Date(order.scheduledDeliveryAt as string)
    : null;
  const finalDate = isScheduled ? reservedDate : expectedDate;

  return {
    deliveryType: order.deliveryType ?? "STANDARD",
    isScheduled,
    effectiveLeadDays,
    expectedDate,
    reservedDate,
    finalDate,
  };
}
