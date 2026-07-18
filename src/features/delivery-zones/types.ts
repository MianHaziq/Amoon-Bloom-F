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
