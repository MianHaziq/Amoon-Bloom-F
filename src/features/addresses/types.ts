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
  /** Neighborhood/community free text — the checkout form's primary location field. */
  area: string | null;
  /** Selected zone (e.g. emirate) id. Null if unset, or if the zone was later
   * deleted (onDelete: SetNull clears this). */
  deliveryZoneId: string | null;
  /** The zone's current name/name_ar, populated whenever deliveryZoneId is set. */
  deliveryZone: { id: string; name: string; name_ar: string | null } | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAddressCreateInput {
  label?: string | null;
  fullName: string;
  phone: string;
  streetAddress?: string;
  apartment?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  area?: string | null;
  deliveryZoneId?: string | null;
  isDefault?: boolean;
}

export type ApiAddressUpdateInput = Partial<ApiAddressCreateInput>;
