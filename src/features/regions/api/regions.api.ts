import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiRegion,
  ApiRegionCreateInput,
  ApiRegionUpdateInput,
} from "../types";

export const regionsApi = {
  /**
   * Lists regions. `GET /regions` is public + region-aware: a public caller
   * sees only ACTIVE regions, while a staff token (admin/manager) returns ALL
   * regions including inactive ones. The response is an array (not paginated)
   * with `meta.total`. Ordered by `sortOrder` ascending.
   */
  async list(): Promise<ApiRegion[]> {
    const { data } = await http.get<PaginatedResponse<ApiRegion>>("/regions");
    return data.data;
  },

  // --- Admin / Manager (REGIONS) ---
  async create(payload: ApiRegionCreateInput): Promise<ApiRegion> {
    const { data } = await http.post<ApiResponse<ApiRegion>>("/regions", payload);
    return data.data;
  },

  async update(id: string, payload: ApiRegionUpdateInput): Promise<ApiRegion> {
    const { data } = await http.put<ApiResponse<ApiRegion>>(
      `/regions/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Deletes a region. The backend returns 409 if the region is the default or
   * is referenced by products/users/orders — surface that message to the user.
   */
  async remove(id: string): Promise<void> {
    await http.delete(`/regions/${id}`);
  },
};
