import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiDeliveryZone,
  ApiDeliveryZoneCreateInput,
  ApiDeliveryZoneUpdateInput,
} from "../types";

export const deliveryZonesApi = {
  /**
   * Lists delivery zones. `GET /delivery-zones?region=UAE` is public + scoped:
   * a public caller sees only ACTIVE zones for that region (empty if `region`
   * is omitted); a staff token returns all zones, including inactive ones,
   * across all regions if `region` is omitted.
   */
  async list(regionCode?: string): Promise<ApiDeliveryZone[]> {
    const { data } = await http.get<PaginatedResponse<ApiDeliveryZone>>(
      "/delivery-zones",
      { params: regionCode ? { region: regionCode } : undefined }
    );
    return data.data;
  },

  // --- Admin / Manager (DELIVERY_ZONES) ---
  async create(payload: ApiDeliveryZoneCreateInput): Promise<ApiDeliveryZone> {
    const { data } = await http.post<ApiResponse<ApiDeliveryZone>>("/delivery-zones", payload);
    return data.data;
  },

  async update(id: string, payload: ApiDeliveryZoneUpdateInput): Promise<ApiDeliveryZone> {
    const { data } = await http.put<ApiResponse<ApiDeliveryZone>>(
      `/delivery-zones/${id}`,
      payload
    );
    return data.data;
  },

  /** Frictionless — no "in use" guard server-side; referencing addresses fall back gracefully. */
  async remove(id: string): Promise<void> {
    await http.delete(`/delivery-zones/${id}`);
  },

  /**
   * Persist admin drag-and-drop order of zones. sortOrder is scoped per-region,
   * so callers reorder the zones of a single region at a time.
   */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await http.patch("/delivery-zones/order", { items });
  },
};
