/**
 * Region types — match `REGION_SELECT` in
 * Amoonis-Boutique-B/src/services/region.service.js and the `Region` Prisma
 * model. The `code` (uppercase) is the value sent as the `X-Region` header by
 * the storefront/mobile clients.
 */

export interface ApiRegion {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  /** ISO 4217 currency code shown/charged for this region (e.g. "AED", "SAR"). */
  currency: string;
  /** Legal entity name shown in the storefront footer's copyright line for this
   * region. Null/blank falls back to the frontend's default siteConfig.legalEntity. */
  legalEntity: string | null;
  /** Flat shipping fee charged on every order placed in this region. Null = free
   * (no fee configured). Serialized as a string (Prisma Decimal), like Product.price. */
  shippingFlatRate: string | null;
  /** ISO 3166-1 alpha-2 code (e.g. "AE") — renders this region's flag in the
   * storefront's country/region pickers. Null shows a neutral placeholder. */
  iso2: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRegionCreateInput {
  code: string;
  name: string;
  name_ar?: string | null;
  currency?: string;
  legalEntity?: string | null;
  shippingFlatRate?: number | null;
  iso2?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type ApiRegionUpdateInput = Partial<ApiRegionCreateInput>;
