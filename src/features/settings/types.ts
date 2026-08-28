export interface ApiSettings {
  id: string;
  siteName: string;
  logo: string | null;
  contactEmail: string | null;
  supportEmail: string | null;
  currency: string;
  maintenanceMode: boolean;
  hiddenPages: string[];
  /** Master switch for the reviews feature. When false, only signed-in customers can submit a review. */
  allowGuestReviews: boolean;
  /** Fallback "ships within N day(s)" prep/booking lead time (whole days) used when
   *  a product has no Category.deliveryLeadDays/Product.deliveryLeadDays override. */
  defaultDeliveryLeadDays: number;
  /** Global default storefront language ("en" | "ar") for a first-time visitor. */
  defaultLocale: "en" | "ar";
  updatedAt: string;
}

export interface ApiPublicSettings {
  hiddenPages: string[];
  maintenanceMode?: boolean;
  allowGuestReviews?: boolean;
  /** Global default storefront language ("en" | "ar") for a first-time visitor. */
  defaultLocale?: "en" | "ar";
}

export interface ApiSettingsUpdateInput {
  siteName?: string;
  logo?: string | null;
  contactEmail?: string | null;
  supportEmail?: string | null;
  currency?: string;
  maintenanceMode?: boolean;
  hiddenPages?: string[];
  allowGuestReviews?: boolean;
  defaultDeliveryLeadDays?: number;
  defaultLocale?: "en" | "ar";
}
