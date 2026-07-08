import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiSection,
  ApiSectionCreateInput,
  ApiSectionUpdateInput,
} from "../types";

export const sectionsApi = {
  async list(region?: string): Promise<ApiSection[]> {
    const { data } = await http.get<PaginatedResponse<ApiSection>>("/sections", {
      params: region ? { region } : undefined,
    });
    return data.data;
  },

  async getById(id: string): Promise<ApiSection> {
    const { data } = await http.get<ApiResponse<ApiSection>>(`/sections/${id}`);
    return data.data;
  },

  async create(payload: ApiSectionCreateInput): Promise<ApiSection> {
    const { data } = await http.post<ApiResponse<ApiSection>>("/sections", payload);
    return data.data;
  },

  async update(id: string, payload: ApiSectionUpdateInput): Promise<ApiSection> {
    const { data } = await http.put<ApiResponse<ApiSection>>(
      `/sections/${id}`,
      payload
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/sections/${id}`);
  },

  /** Persist admin drag-and-drop order of sections. */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await http.patch("/sections/order", { items });
  },
};
