import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiCashArrangementConfig,
  ApiCashArrangementConfigUpdateInput,
  ApiCashArrangementResolveInput,
  ApiCashArrangementResolveResult,
  ApiPublicCashArrangementConfig,
} from "../types";

export const cashArrangementApi = {
  /**
   * Public enablement config for the CURRENT region — resolved server-side from the
   * `X-Region` header the http client already attaches to every request.
   */
  async getPublic(): Promise<ApiPublicCashArrangementConfig> {
    const { data } = await http.get<ApiResponse<ApiPublicCashArrangementConfig>>(
      "/cash-arrangement/public"
    );
    return data.data;
  },

  /**
   * Cart/zone-aware resolve — POST because `cartLines` is an array body, same reasoning as
   * `POST /promo-codes/validate`. Region comes from the `X-Region` header; no region param
   * needed. This is what checkout calls live as the customer builds their cash request.
   */
  async resolve(
    payload: ApiCashArrangementResolveInput
  ): Promise<ApiCashArrangementResolveResult> {
    const { data } = await http.post<ApiResponse<ApiCashArrangementResolveResult>>(
      "/cash-arrangement/resolve",
      payload
    );
    return data.data;
  },

  // --- Admin / Manager (CASH_ARRANGEMENT) ---

  /** Every region with its enablement config (or a disabled default) — for the region picker. */
  async list(): Promise<ApiCashArrangementConfig[]> {
    const { data } = await http.get<ApiResponse<ApiCashArrangementConfig[]>>("/cash-arrangement");
    return data.data;
  },

  /** Full enablement config for one region, including scoped product/category ids. */
  async getByRegion(regionId: string): Promise<ApiCashArrangementConfig> {
    const { data } = await http.get<ApiResponse<ApiCashArrangementConfig>>(
      `/cash-arrangement/${regionId}`
    );
    return data.data;
  },

  async update(
    regionId: string,
    payload: ApiCashArrangementConfigUpdateInput
  ): Promise<ApiCashArrangementConfig> {
    const { data } = await http.put<ApiResponse<ApiCashArrangementConfig>>(
      `/cash-arrangement/${regionId}`,
      payload
    );
    return data.data;
  },
};
