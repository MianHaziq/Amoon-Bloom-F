import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { ApiOrder } from "@/features/orders/types";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Push an arbitrary event onto the GTM dataLayer. No-ops server-side/SSR. */
export function pushToDataLayer(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/**
 * Fires the GA4-style Enhanced Ecommerce "purchase" event on the order
 * confirmation page — order id/value/currency/payment/shipping/tax plus a
 * per-line items array, matching what GTM's standard Purchase trigger expects.
 *
 * Deduped per order id via sessionStorage: the confirmation page can be
 * refreshed or remounted (guest flow reads from a sessionStorage stash), and
 * without this guard that would double-count the same order's revenue.
 */
export function trackPurchase(order: ApiOrder): void {
  if (typeof window === "undefined") return;
  const dedupeKey = `${STORAGE_KEYS.gtmPurchaseTrackedPrefix}${order.id}`;
  try {
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // sessionStorage unavailable (private mode, etc.) — fire once anyway
    // rather than silently dropping the event.
  }

  pushToDataLayer({ ecommerce: null }); // clear the previous ecommerce object per GTM's recommended pattern
  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: order.orderNumber ?? order.id,
      value: order.totalAmount,
      currency: order.currency ?? "AED",
      shipping: order.shippingAmount ?? 0,
      tax: order.taxAmount ?? order.vatAmount ?? 0,
      payment_type: order.paymentMethod,
      items: (order.items ?? []).map((item, index) => ({
        item_id: item.productId ?? item.product?.id ?? undefined,
        item_name: item.product?.title ?? "Deleted product",
        price: item.price,
        quantity: item.quantity,
        index,
      })),
    },
  });
}
