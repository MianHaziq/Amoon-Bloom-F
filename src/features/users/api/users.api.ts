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

// The backend `User` model has a single `fullName` column — there is no
// firstName/lastName split server-side (see Amoonis-Boutique-B/prisma/schema.prisma
// and user.controller.js's transformUser, which only ever reads/writes
// `fullName`). `ApiAdminUser`/`ApiUserCreateInput`/`ApiUserUpdateInput` model a
// split firstName/lastName for the admin form's UX, so this API layer is the
// single place that reconciles the two: split on read, join on write.
type RawApiUser = Omit<ApiAdminUser, "firstName" | "lastName"> & {
  fullName?: string | null;
};

function splitFullName(name: string | null | undefined): { firstName: string; lastName: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function joinFullName(firstName: string | undefined, lastName: string | undefined): string {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
}

function toApiAdminUser(raw: RawApiUser): ApiAdminUser {
  const { firstName, lastName } = splitFullName(raw.fullName ?? raw.name);
  return { ...raw, firstName, lastName };
}

export const usersApi = {
  async list(
    params: ApiUserListParams = {}
  ): Promise<PaginatedResponse<ApiAdminUser>> {
    const { data } = await http.get<PaginatedResponse<RawApiUser>>("/users", {
      params,
    });
    return { ...data, data: data.data.map(toApiAdminUser) };
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
    const { data } = await http.get<ApiResponse<RawApiUser>>(`/users/${id}`);
    return toApiAdminUser(data.data);
  },

  async create(payload: ApiUserCreateInput): Promise<ApiAdminUser> {
    const { firstName, lastName, ...rest } = payload;
    const body = { ...rest, fullName: joinFullName(firstName, lastName) };
    const { data } = await http.post<ApiResponse<RawApiUser>>("/users", body);
    return toApiAdminUser(data.data);
  },

  async update(id: string, payload: ApiUserUpdateInput): Promise<ApiAdminUser> {
    const { firstName, lastName, ...rest } = payload;
    const body: Record<string, unknown> = { ...rest };
    // Only send fullName when the form actually touched a name field — an
    // edit that doesn't change the name shouldn't overwrite it with "".
    if (firstName !== undefined || lastName !== undefined) {
      body.fullName = joinFullName(firstName, lastName);
    }
    const { data } = await http.put<ApiResponse<RawApiUser>>(`/users/${id}`, body);
    return toApiAdminUser(data.data);
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
