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
  updatedAt: string;
}

export interface ApiPublicSettings {
  hiddenPages: string[];
  maintenanceMode?: boolean;
  allowGuestReviews?: boolean;
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
}
