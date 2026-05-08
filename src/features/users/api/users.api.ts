import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiAdminUser,
  ApiManagerPermissionDescriptor,
  ApiUserCreateInput,
  ApiUserListParams,
  ApiUserRoleChangeInput,
  ApiUserStats,
  ApiUserUpdateInput,
  UserStatusEnum,
} from "../types";

export const usersApi = {
  async list(
    params: ApiUserListParams = {}
  ): Promise<PaginatedResponse<ApiAdminUser>> {
    const { data } = await http.get<PaginatedResponse<ApiAdminUser>>("/users", {
      params,
    });
    return data;
  },

  async stats(): Promise<ApiUserStats> {
    const { data } = await http.get<ApiResponse<ApiUserStats>>("/users/stats");
    return data.data;
  },

  async permissionsCatalog(): Promise<ApiManagerPermissionDescriptor[]> {
    const { data } = await http.get<
      ApiResponse<{ permissions: ApiManagerPermissionDescriptor[] }>
    >("/users/manager-permissions");
    return data.data.permissions;
  },

  async getById(id: string): Promise<ApiAdminUser> {
    const { data } = await http.get<ApiResponse<ApiAdminUser>>(`/users/${id}`);
    return data.data;
  },

  async create(payload: ApiUserCreateInput): Promise<ApiAdminUser> {
    const { data } = await http.post<ApiResponse<ApiAdminUser>>("/users", payload);
    return data.data;
  },

  async update(id: string, payload: ApiUserUpdateInput): Promise<ApiAdminUser> {
    const { data } = await http.put<ApiResponse<ApiAdminUser>>(`/users/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/users/${id}`);
  },

  async setStatus(id: string, status?: UserStatusEnum): Promise<ApiAdminUser> {
    const { data } = await http.patch<ApiResponse<ApiAdminUser>>(
      `/users/${id}/status`,
      status === undefined ? {} : { status }
    );
    return data.data;
  },

  async setRole(
    id: string,
    payload: ApiUserRoleChangeInput
  ): Promise<ApiAdminUser> {
    const { data } = await http.patch<ApiResponse<ApiAdminUser>>(
      `/users/${id}/role`,
      payload
    );
    return data.data;
  },
};
