import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiPromoCode,
  ApiPromoCodeCreateInput,
  ApiPromoCodeListParams,
  ApiPromoCodeUpdateInput,
  ApiPromoValidateInput,
  ApiPromoValidationResult,
} from "../types";

export const promoCodesApi = {
  // --- Customer ---
  async listAvailable(
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<ApiPromoCode>> {
    const { data } = await http.get<PaginatedResponse<ApiPromoCode>>(
      "/promo-codes/available",
      { params }
    );
    return data;
  },

  async validate(payload: ApiPromoValidateInput): Promise<ApiPromoValidationResult> {
    const { data } = await http.post<ApiResponse<ApiPromoValidationResult>>(
      "/promo-codes/validate",
      payload
    );
    return data.data;
  },

  // --- Admin / Manager (PROMO_CODES) ---
  async list(
    params: ApiPromoCodeListParams = {}
  ): Promise<PaginatedResponse<ApiPromoCode>> {
    const { data } = await http.get<PaginatedResponse<ApiPromoCode>>(
      "/promo-codes",
      { params }
    );
    return data;
  },

  async getById(id: string): Promise<ApiPromoCode> {
    const { data } = await http.get<ApiResponse<ApiPromoCode>>(`/promo-codes/${id}`);
    return data.data;
  },

  async create(payload: ApiPromoCodeCreateInput): Promise<ApiPromoCode> {
    const { data } = await http.post<ApiResponse<ApiPromoCode>>(
      "/promo-codes",
      payload
    );
    return data.data;
  },

  async update(id: string, payload: ApiPromoCodeUpdateInput): Promise<ApiPromoCode> {
    const { data } = await http.put<ApiResponse<ApiPromoCode>>(
      `/promo-codes/${id}`,
      payload
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/promo-codes/${id}`);
  },
};
