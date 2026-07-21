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

  /**
   * Links ALL existing products, categories and/or sections to this region in
   * one shot — a new region otherwise starts with zero visible products/
   * categories/sections (same "no rows = visible in none" rule Product/Category/
   * Section/Banner region-scoping already uses). Sections only render on the
   * storefront when they also have in-region products, so link all three
   * together. Idempotent: only adds missing links, safe to call more than once.
   */
  async bulkAssign(
    id: string,
    payload: { products?: boolean; categories?: boolean; sections?: boolean }
  ): Promise<{ productsLinked: number; categoriesLinked: number; sectionsLinked: number }> {
    const { data } = await http.post<
      ApiResponse<{ productsLinked: number; categoriesLinked: number; sectionsLinked: number }>
    >(`/regions/${id}/bulk-assign`, payload);
    return data.data;
  },

  /** Persist admin drag-and-drop order of regions (drives the region picker order). */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await http.patch("/regions/order", { items });
  },
};
