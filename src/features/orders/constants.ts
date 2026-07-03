import type { OrderStatus } from "./types";
import type { MessageKey } from "@/i18n";

/**
 * Order-status constants shared by the admin panel and the storefront (account
 * pages + public order-status lookup). Kept in the orders feature — not under
 * components/admin — so customer-facing pages don't import from the admin tree.
 */

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "neutral" | "bloom" | "blush" | "gold" | "success" | "warning" | "danger" | "ink"
> = {
  PENDING: "warning",
  CONFIRMED: "bloom",
  PROCESSING: "gold",
  SHIPPED: "blush",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/**
 * i18n key per status for the storefront (account + order-status pages). Admin
 * keeps the plain-English `ORDER_STATUS_LABEL` above; storefront resolves these
 * through `t()` so statuses render in Arabic.
 */
export const ORDER_STATUS_LABEL_KEY: Record<OrderStatus, MessageKey> = {
  PENDING: "orderStatus.PENDING",
  CONFIRMED: "orderStatus.CONFIRMED",
  PROCESSING: "orderStatus.PROCESSING",
  SHIPPED: "orderStatus.SHIPPED",
  DELIVERED: "orderStatus.DELIVERED",
  CANCELLED: "orderStatus.CANCELLED",
};
