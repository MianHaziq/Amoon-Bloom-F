/**
 * Order types — match `toOrderResponsePayload` in
 * Amoonis-Boutique-B/src/services/order.service.js.
 */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD";

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface OrderItemProductSnapshot {
  id: string | null;
  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  image: string | null;
  images: string[];
  descriptions: Array<{
    id: string;
    title: string | null;
    title_ar: string | null;
    description: string;
    description_ar: string | null;
  }>;
  productOptions: Array<{
    id: string;
    title: string;
    title_ar: string | null;
    options: string[];
    options_ar: string[];
  }>;
  deleted?: boolean;
}

export interface ApiOrderItem {
  id: string;
  productId: string | null;
  product: OrderItemProductSnapshot | null;
  quantity: number;
  perProductMessage: string | null;
  price: number;
}

export interface ApiOrder {
  id: string;
  userId: string;
  orderMessage: string | null;
  totalAmount: number;
  discountAmount: number | null;
  appliedPromoCode: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingAddress: OrderShippingAddress | null;
  inventoryDeducted: boolean;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
}

export interface ApiOrderStatusLite {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  progress: { current: number; total: number };
  createdAt: string;
  updatedAt: string;
}

export interface ApiCheckoutInput {
  addressId?: string;
  shippingAddress?: OrderShippingAddress;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
}

export interface ApiOrderHistoryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface ApiAdminOrderHistoryParams extends ApiOrderHistoryParams {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeItems?: boolean;
}
