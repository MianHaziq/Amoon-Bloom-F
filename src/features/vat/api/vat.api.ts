import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiPublicVatConfig,
  ApiVatConfig,
  ApiVatConfigUpdateInput,
} from "../types";

export const vatApi = {
  /**
   * Public VAT config for a region. Client calls omit `region` and rely on the
   * `X-Region` header the http client already attaches to every request; Server
   * Component callers (no header interceptor) pass the region code explicitly,
   * same convention as `productsApi.list({ region })`.
   */
  async getPublic(region?: string): Promise<ApiPublicVatConfig> {
    const { data } = await http.get<ApiResponse<ApiPublicVatConfig>>("/vat/public", {
      params: region ? { region } : undefined,
    });
    return data.data;
  },

  // --- Admin / Manager (SETTINGS) ---

  /** Every region with its VAT config (or a disabled default) — for the region picker. */
  async list(): Promise<ApiVatConfig[]> {
    const { data } = await http.get<ApiResponse<ApiVatConfig[]>>("/vat");
    return data.data;
  },

  /** Full config for one region, including scoped product/category ids. */
  async getByRegion(regionId: string): Promise<ApiVatConfig> {
    const { data } = await http.get<ApiResponse<ApiVatConfig>>(`/vat/${regionId}`);
    return data.data;
  },

  async update(
    regionId: string,
    payload: ApiVatConfigUpdateInput
  ): Promise<ApiVatConfig> {
    const { data } = await http.put<ApiResponse<ApiVatConfig>>(
      `/vat/${regionId}`,
      payload
    );
    return data.data;
  },
};
