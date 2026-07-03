/**
 * Order-status constants moved to `@/features/orders/constants` so storefront
 * pages don't import from the admin tree. Re-exported here for backwards
 * compatibility with existing admin imports.
 */
export {
  ORDER_STATUSES,
  ORDER_STATUS_TONE,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_LABEL_KEY,
} from "@/features/orders/constants";
