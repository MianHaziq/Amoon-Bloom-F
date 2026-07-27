import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type { ResolvedDeliveryConfig } from "../types";

export const deliveryConfigApi = {
  /**
   * Resolve delivery configuration for a region (and optional zone) with the
   * zone→region→default inheritance already applied server-side. Pass `subtotal` so the
   * effective fee / free-delivery status is computed for the current cart.
   */
  async get(params: {
    region?: string;
    zoneId?: string;
    subtotal?: number;
  }): Promise<ResolvedDeliveryConfig> {
    const { data } = await http.get<ApiResponse<ResolvedDeliveryConfig>>("/delivery-config", {
      params: {
        ...(params.region ? { region: params.region } : {}),
        ...(params.zoneId ? { zoneId: params.zoneId } : {}),
        ...(params.subtotal != null ? { subtotal: params.subtotal } : {}),
      },
    });
    return data.data;
  },
};
