import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiCategory,
  ApiCategoryCreateInput,
  ApiCategoryDetail,
  ApiCategoryUpdateInput,
} from "../api-types";

export const categoriesApi = {
  async list(): Promise<ApiCategory[]> {
    const { data } = await http.get<PaginatedResponse<ApiCategory>>("/categories");
    return data.data;
  },

  async getById(id: string): Promise<ApiCategoryDetail> {
    const { data } = await http.get<ApiResponse<ApiCategoryDetail>>(`/categories/${id}`);
    return data.data;
  },

  async create(payload: ApiCategoryCreateInput): Promise<ApiCategory> {
    const { data } = await http.post<ApiResponse<ApiCategory>>("/categories", payload);
    return data.data;
  },

  async update(id: string, payload: ApiCategoryUpdateInput): Promise<ApiCategory> {
    const { data } = await http.put<ApiResponse<ApiCategory>>(`/categories/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/categories/${id}`);
  },
};
