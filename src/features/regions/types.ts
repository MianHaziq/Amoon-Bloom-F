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
  /** Per-region contact/legal info shown across the storefront (footer, support
   * section, WhatsApp button, contact page, legal pages, checkout receipt, order
   * emails). Same fallback convention as legalEntity: null falls back to the
   * frontend's siteConfig.contact.*. address_ar/hours_ar fall back to the
   * English value when unset. */
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  address_ar: string | null;
  hours: string | null;
  hours_ar: string | null;
  /** Legal citations shown across the 5 storefront legal pages (Privacy, Terms,
   * Refund Policy, Shipping Policy, Product Disclaimer) — e.g. the IP law
   * citation, the consumer-protection regulator name. REQUIRED when creating a
   * region (see ApiRegionCreateInput) so a region can never go live with the
   * wrong country's law citations. Nullable here only because regions created
   * before this feature existed (or via a stale client) may not have them —
   * the frontend falls back to generic, non-country-specific wording for
   * those, never to another region's specific citation. See
   * src/features/location/regionContact.ts. */
  registrationCity: string | null;
  registrationCity_ar: string | null;
  currencyDisplayName: string | null;
  currencyDisplayName_ar: string | null;
  vatLawName: string | null;
  vatLawName_ar: string | null;
  dataProtectionLawName: string | null;
  dataProtectionLawName_ar: string | null;
  dataProtectionAuthority: string | null;
  dataProtectionAuthority_ar: string | null;
  ipLawName: string | null;
  ipLawName_ar: string | null;
  consumerProtectionLawName: string | null;
  consumerProtectionLawName_ar: string | null;
  consumerProtectionAuthority: string | null;
  consumerProtectionAuthority_ar: string | null;
  standardsAuthority: string | null;
  standardsAuthority_ar: string | null;
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
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  address_ar?: string | null;
  hours?: string | null;
  hours_ar?: string | null;
  /** Required — see ApiRegion's doc-comment above. */
  registrationCity: string;
  registrationCity_ar: string;
  currencyDisplayName: string;
  currencyDisplayName_ar: string;
  vatLawName: string;
  vatLawName_ar: string;
  dataProtectionLawName: string;
  dataProtectionLawName_ar: string;
  dataProtectionAuthority: string;
  dataProtectionAuthority_ar: string;
  ipLawName: string;
  ipLawName_ar: string;
  consumerProtectionLawName: string;
  consumerProtectionLawName_ar: string;
  consumerProtectionAuthority: string;
  consumerProtectionAuthority_ar: string;
  standardsAuthority: string;
  standardsAuthority_ar: string;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type ApiRegionUpdateInput = Partial<ApiRegionCreateInput>;
