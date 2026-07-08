import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { ApiBanner, ApiBannerCreateInput, BannerPlatform } from "../types";

export const bannersApi = {
  async list(
    region?: string,
    platform?: BannerPlatform
  ): Promise<ApiBanner[]> {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    if (platform) params.platform = platform;
    const { data } = await http.get<PaginatedResponse<ApiBanner>>("/banners", {
      params: Object.keys(params).length ? params : undefined,
    });
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
