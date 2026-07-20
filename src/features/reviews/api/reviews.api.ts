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

  /**
   * Upload one review photo and get back its CDN URL. Public endpoint (customers
   * and guests) — collect the returned URLs and pass them as `media` to `create`.
   */
  async uploadMedia(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<ApiResponse<{ url: string }>>(
      "/reviews/media",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data.url;
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
