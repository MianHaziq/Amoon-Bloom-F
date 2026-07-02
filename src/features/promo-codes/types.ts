/**
 * Promo code types — match `mapPromoCode` in
 * Amoonis-Boutique-B/src/services/promoCode.service.js.
 */

export type PromoDiscountType = "PERCENTAGE" | "FIXED";

export type PromoAppliesTo =
  | "ALL_PRODUCTS"
  | "SPECIFIC_PRODUCTS"
  | "SPECIFIC_CATEGORIES";

export type PromoStatusFilter = "active" | "expired" | "scheduled" | "inactive";

export interface ApiPromoCode {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  discountType: PromoDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  appliesTo: PromoAppliesTo;
  productIds?: string[];
  categoryIds?: string[];
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageCount?: number;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  /** Restrict redemption to accounts younger than `newUserWithinDays`. */
  newUsersOnly?: boolean;
  newUserWithinDays?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPromoCodeCreateInput {
  code: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  discountType: PromoDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  appliesTo?: PromoAppliesTo;
  productIds?: string[];
  categoryIds?: string[];
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  newUsersOnly?: boolean;
  newUserWithinDays?: number | null;
  isActive?: boolean;
}

export type ApiPromoCodeUpdateInput = Partial<ApiPromoCodeCreateInput>;

export interface ApiPromoCodeListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PromoStatusFilter;
}

export interface ApiPromoValidateInput {
  code: string;
  items?: Array<{ productId: string; quantity: number }>;
}

/**
 * Success payload of `POST /promo-codes/validate` — mirrors
 * promoCodeService.validateAndCalculate EXACTLY. An INVALID code does NOT come
 * back in this shape: the backend throws an HTTP 400/404 whose `{ message }` is
 * the human reason (min order not met, expired, new-users-only, …). So a
 * resolved promise here always means "valid & applied".
 */
export interface ApiPromoValidationResult {
  promoCode: {
    id: string;
    code: string;
    name: string;
    discountType: PromoDiscountType;
    discountValue: number;
    appliesTo: PromoAppliesTo;
    newUsersOnly: boolean;
    newUserWithinDays: number | null;
  };
  cartSubtotal: number;
  eligibleSubtotal: number;
  discountAmount: number;
  total: number;
  eligibleProductIds: string[];
}
