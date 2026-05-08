import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiAdminOrderHistoryParams,
  ApiCheckoutInput,
  ApiOrder,
  ApiOrderHistoryParams,
  ApiOrderListRow,
  ApiOrderStatusLite,
  OrderStatus,
} from "../types";

export const ordersApi = {
  // --- Customer ---
  async checkout(payload: ApiCheckoutInput): Promise<ApiOrder> {
    const { data } = await http.post<ApiResponse<ApiOrder>>(
      "/orders/checkout",
      payload
    );
    return data.data;
  },

  async myHistory(
    params: ApiOrderHistoryParams = {}
  ): Promise<PaginatedResponse<ApiOrderListRow>> {
    const { data } = await http.get<PaginatedResponse<ApiOrderListRow>>(
      "/orders/history",
      { params }
    );
    return data;
  },

  async getById(id: string): Promise<ApiOrder> {
    const { data } = await http.get<ApiResponse<ApiOrder>>(`/orders/${id}`);
    return data.data;
  },

  async getStatus(id: string): Promise<ApiOrderStatusLite> {
    const { data } = await http.get<ApiResponse<ApiOrderStatusLite>>(
      `/orders/${id}/status`
    );
    return data.data;
  },

  // --- Admin / Manager (ORDERS permission) ---
  async listAdmin(
    params: ApiOrderHistoryParams = {}
  ): Promise<PaginatedResponse<ApiOrderListRow>> {
    const { data } = await http.get<PaginatedResponse<ApiOrderListRow>>(
      "/orders",
      {
        params,
      }
    );
    return data;
  },

  async adminHistory(
    params: ApiAdminOrderHistoryParams = {}
  ): Promise<PaginatedResponse<ApiOrderListRow>> {
    const { data } = await http.get<PaginatedResponse<ApiOrderListRow>>(
      "/orders/admin/history",
      { params }
    );
    return data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<ApiOrder> {
    const { data } = await http.patch<ApiResponse<ApiOrder>>(
      `/orders/${id}/status`,
      { status }
    );
    return data.data;
  },
};
