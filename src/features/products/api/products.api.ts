import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiProduct,
  ApiProductCreateInput,
  ApiProductListParams,
  ApiProductUpdateInput,
} from "../api-types";

/**
 * Backend product endpoints (`/products`). List + detail are public; create,
 * update, delete require admin or manager-with-PRODUCTS-permission.
 */
export const productsApi = {
  async list(params: ApiProductListParams = {}): Promise<PaginatedResponse<ApiProduct>> {
    const { data } = await http.get<PaginatedResponse<ApiProduct>>("/products", {
      params,
    });
    return data;
  },

  async listByCategory(
    categoryId: string,
    params: ApiProductListParams = {}
  ): Promise<PaginatedResponse<ApiProduct>> {
    const { data } = await http.get<PaginatedResponse<ApiProduct>>(
      `/products/category/${categoryId}`,
      { params }
    );
    return data;
  },

  /**
   * Full-text-ish product search (`/products/search`). Matches title/subtitle
   * (EN + AR) and category name; backed by pg_trgm indexes so it stays fast.
   * Storefront calls are region-scoped like `list`. A blank `q` returns nothing.
   */
  async search(
    q: string,
    params: ApiProductListParams = {}
  ): Promise<PaginatedResponse<ApiProduct>> {
    const { data } = await http.get<PaginatedResponse<ApiProduct>>(
      "/products/search",
      { params: { ...params, q } }
    );
    return data;
  },

  async getById(id: string, region?: string): Promise<ApiProduct> {
    const { data } = await http.get<ApiResponse<ApiProduct>>(`/products/${id}`, {
      params: region ? { region } : undefined,
    });
    return data.data;
  },

  async create(payload: ApiProductCreateInput): Promise<ApiProduct> {
    const { data } = await http.post<ApiResponse<ApiProduct>>("/products", payload);
    return data.data;
  },

  async update(id: string, payload: ApiProductUpdateInput): Promise<ApiProduct> {
    const { data } = await http.put<ApiResponse<ApiProduct>>(`/products/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/products/${id}`);
  },
};
