import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiContactListParams,
  ApiContactMessage,
  ApiContactStats,
  ApiContactSubmitInput,
  ContactStatus,
} from "../types";

export const contactApi = {
  async submit(payload: ApiContactSubmitInput): Promise<void> {
    await http.post("/contact", payload);
  },

  // --- Admin / Manager (CONTACT) ---
  async stats(): Promise<ApiContactStats> {
    const { data } = await http.get<ApiResponse<ApiContactStats>>(
      "/contact/admin/stats"
    );
    return data.data;
  },

  async list(
    params: ApiContactListParams = {}
  ): Promise<PaginatedResponse<ApiContactMessage>> {
    const { data } = await http.get<PaginatedResponse<ApiContactMessage>>(
      "/contact/admin/messages",
      { params }
    );
    return data;
  },

  async getById(id: string): Promise<ApiContactMessage> {
    const { data } = await http.get<ApiResponse<ApiContactMessage>>(
      `/contact/admin/${id}`
    );
    return data.data;
  },

  async setStatus(id: string, status: ContactStatus): Promise<ApiContactMessage> {
    const { data } = await http.patch<ApiResponse<ApiContactMessage>>(
      `/contact/admin/${id}/status`,
      { status }
    );
    return data.data;
  },

  async setNote(id: string, note: string): Promise<ApiContactMessage> {
    const { data } = await http.patch<ApiResponse<ApiContactMessage>>(
      `/contact/admin/${id}/note`,
      { note }
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/contact/admin/${id}`);
  },
};
