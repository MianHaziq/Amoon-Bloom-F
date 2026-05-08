import type { OrderStatus } from "@/features/orders/types";

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
