import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiAddress,
  ApiAddressCreateInput,
  ApiAddressUpdateInput,
} from "../types";

export const addressesApi = {
  async list(): Promise<ApiAddress[]> {
    const { data } = await http.get<ApiResponse<ApiAddress[]>>("/user/addresses");
    return data.data;
  },

  async getById(id: string): Promise<ApiAddress> {
    const { data } = await http.get<ApiResponse<ApiAddress>>(`/user/addresses/${id}`);
    return data.data;
  },

  async create(payload: ApiAddressCreateInput): Promise<ApiAddress> {
    const { data } = await http.post<ApiResponse<ApiAddress>>(
      "/user/addresses",
      payload
    );
    return data.data;
  },

  async update(id: string, payload: ApiAddressUpdateInput): Promise<ApiAddress> {
    const { data } = await http.patch<ApiResponse<ApiAddress>>(
      `/user/addresses/${id}`,
      payload
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/user/addresses/${id}`);
  },
};
