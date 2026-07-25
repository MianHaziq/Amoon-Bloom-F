/**
 * Delivery zone types — match `ZONE_SELECT` in
 * Amoonis-Boutique-B/src/services/deliveryZone.service.js and the `DeliveryZone`
 * Prisma model. A zone (e.g. an emirate) belongs to exactly one region.
 */

export interface ApiDeliveryZone {
  id: string;
  regionId: string;
  name: string;
  name_ar: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDeliveryZoneCreateInput {
  regionId: string;
  name: string;
  name_ar?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type ApiDeliveryZoneUpdateInput = Partial<ApiDeliveryZoneCreateInput>;

/** Payload for `POST /delivery-zones/bulk` — several zones for ONE region at once. */
export interface ApiDeliveryZoneBulkInput {
  regionId: string;
  zones: { name: string; name_ar?: string | null; isActive?: boolean }[];
}

/** Result of a bulk create: the rows created + any names skipped as duplicates. */
export interface ApiDeliveryZoneBulkResult {
  created: ApiDeliveryZone[];
  skipped: string[];
  count: number;
}
