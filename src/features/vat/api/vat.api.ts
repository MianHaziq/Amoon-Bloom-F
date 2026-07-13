import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiPublicVatConfig,
  ApiVatConfig,
  ApiVatConfigUpdateInput,
} from "../types";

export const vatApi = {
  /**
   * Public VAT config for the CURRENT region — resolved server-side from the
   * `X-Region` header the http client already attaches to every request.
   */
  async getPublic(): Promise<ApiPublicVatConfig> {
    const { data } = await http.get<ApiResponse<ApiPublicVatConfig>>("/vat/public");
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
