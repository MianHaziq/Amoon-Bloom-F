import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { ApiBranch, BranchCreateInput, BranchUpdateInput } from "../types";

export const branchesApi = {
  /**
   * Lists branches. `GET /branches?region=UAE` is public + scoped: a public
   * caller sees only ACTIVE branches for that region; a staff token returns all
   * branches (including inactive) for that region. `region` is a region CODE.
   */
  async list(regionCode?: string): Promise<ApiBranch[]> {
    const { data } = await http.get<PaginatedResponse<ApiBranch>>("/branches", {
      params: regionCode ? { region: regionCode } : undefined,
    });
    return data.data;
  },

  // --- Admin / Manager (REGIONS) ---
  async create(payload: BranchCreateInput): Promise<ApiBranch> {
    const { data } = await http.post<ApiResponse<ApiBranch>>("/branches", payload);
    return data.data;
  },

  async update(id: string, payload: BranchUpdateInput): Promise<ApiBranch> {
    const { data } = await http.put<ApiResponse<ApiBranch>>(`/branches/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/branches/${id}`);
  },

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await http.patch("/branches/order", { items });
  },
};
