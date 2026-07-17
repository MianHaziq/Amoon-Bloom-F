import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiReview,
  ApiReviewAdminListParams,
  ApiReviewCreateInput,
  ApiReviewListParams,
} from "../types";

export const reviewsApi = {
  // --- Public / customer ---
  async listForProduct(
    productId: string,
    params: ApiReviewListParams = {}
  ): Promise<PaginatedResponse<ApiReview>> {
    const { data } = await http.get<PaginatedResponse<ApiReview>>(
      `/reviews/product/${productId}`,
      { params }
    );
    return data;
  },

  async create(productId: string, payload: ApiReviewCreateInput): Promise<ApiReview> {
    const { data } = await http.post<ApiResponse<ApiReview>>(
      `/reviews/product/${productId}`,
      payload
    );
    return data.data;
  },

  // --- Admin / Manager (REVIEWS) ---
  async adminList(
    params: ApiReviewAdminListParams = {}
  ): Promise<PaginatedResponse<ApiReview>> {
    const { data } = await http.get<PaginatedResponse<ApiReview>>("/reviews/admin", {
      params,
    });
    return data;
  },

  async adminRemove(id: string): Promise<void> {
    await http.delete(`/reviews/admin/${id}`);
  },
};
