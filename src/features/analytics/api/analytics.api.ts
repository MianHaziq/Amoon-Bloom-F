import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  AnalyticsRangeParams,
  ApiAnalyticsCategoryRevenue,
  ApiAnalyticsDailySales,
  ApiAnalyticsPreset,
  ApiAnalyticsRevenue,
} from "../types";

export const analyticsApi = {
  async presets(): Promise<ApiAnalyticsPreset[]> {
    const { data } = await http.get<
      ApiResponse<{ presets: ApiAnalyticsPreset[] }>
    >("/admin/analytics/presets");
    return data.data.presets;
  },

  async revenue(params: AnalyticsRangeParams = {}): Promise<ApiAnalyticsRevenue> {
    const { data } = await http.get<ApiResponse<ApiAnalyticsRevenue>>(
      "/admin/analytics/revenue",
      { params }
    );
    return data.data;
  },

  async revenueByCategory(
    params: AnalyticsRangeParams = {}
  ): Promise<ApiAnalyticsCategoryRevenue[]> {
    const { data } = await http.get<ApiResponse<ApiAnalyticsCategoryRevenue[]>>(
      "/admin/analytics/revenue/by-category",
      { params }
    );
    return data.data;
  },

  async salesByDay(
    params: AnalyticsRangeParams = {}
  ): Promise<ApiAnalyticsDailySales[]> {
    const { data } = await http.get<ApiResponse<ApiAnalyticsDailySales[]>>(
      "/admin/analytics/sales/by-day",
      { params }
    );
    return data.data;
  },
};
