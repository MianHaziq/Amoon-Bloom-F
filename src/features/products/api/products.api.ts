import { http } from "@/services/http";
import type { PaginatedResponse, PaginationParams } from "@/types";
import type { Product, ProductFilter } from "../types";

export const productsApi = {
  async list(
    params: PaginationParams & ProductFilter = {}
  ): Promise<PaginatedResponse<Product>> {
    const { data } = await http.get<PaginatedResponse<Product>>("/products", {
      params,
    });
    return data;
  },
  async getBySlug(slug: string): Promise<Product> {
    const { data } = await http.get<Product>(`/products/${slug}`);
    return data;
  },
};
