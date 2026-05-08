export interface ApiSettings {
  id: string;
  siteName: string;
  logo: string | null;
  contactEmail: string | null;
  supportEmail: string | null;
  currency: string;
  maintenanceMode: boolean;
  hiddenPages: string[];
  updatedAt: string;
}

export interface ApiPublicSettings {
  hiddenPages: string[];
}

export interface ApiSettingsUpdateInput {
  siteName?: string;
  logo?: string | null;
  contactEmail?: string | null;
  supportEmail?: string | null;
  currency?: string;
  maintenanceMode?: boolean;
  hiddenPages?: string[];
}
