import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { ApiBanner, ApiBannerCreateInput } from "../types";

export const bannersApi = {
  async list(): Promise<ApiBanner[]> {
    const { data } = await http.get<PaginatedResponse<ApiBanner>>("/banners");
    return data.data;
  },

  async create(payload: ApiBannerCreateInput): Promise<ApiBanner[]> {
    const { data } = await http.post<ApiResponse<ApiBanner[]>>("/banners", payload);
    return data.data;
  },

  async reorder(bannerIds: string[]): Promise<ApiBanner[]> {
    const { data } = await http.patch<ApiResponse<ApiBanner[]>>(
      "/banners/order",
      { order: bannerIds }
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/banners/${id}`);
  },
};
