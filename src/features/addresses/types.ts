/**
 * Address book types — match backend `mapAddress` shape.
 */

export interface ApiAddress {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAddressCreateInput {
  label?: string | null;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault?: boolean;
}

export type ApiAddressUpdateInput = Partial<ApiAddressCreateInput>;
