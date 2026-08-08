/**
 * Admin user-management types. Mirrors `/users/*` responses, which return
 * capitalized `role` and `status` strings (e.g. "Admin", "Active") via
 * `transformUser` in the backend controller. Mutation inputs use the raw
 * enum (uppercase).
 */

export type UserRoleEnum = "CUSTOMER" | "ADMIN" | "MANAGER";
export type UserStatusEnum = "ACTIVE" | "INACTIVE";

/** Capitalized form returned by `/users/*` list/detail endpoints. */
export type UserRoleDisplay = "Customer" | "Admin" | "Manager";
export type UserStatusDisplay = "Active" | "Inactive";

export type ManagerPermission =
  | "PRODUCTS"
  | "ORDERS"
  | "CATEGORIES"
  | "SECTIONS"
  | "BANNERS"
  | "CONTACT"
  | "SETTINGS"
  | "PROMO_CODES"
  | "ANALYTICS"
  | "REGIONS"
  | "REVIEWS"
  | "DELIVERY_ZONES"
  | "VAT"
  | "CASH_ARRANGEMENT"
  | "NOTIFICATIONS"
  | "USERS"
  | "MANAGERS";

/** Region a manager is scoped to (subset of the store's regions). */
export interface ApiManagedRegion {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
}

export interface ApiAdminUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: UserRoleDisplay;
  status: UserStatusDisplay;
  managerTitle: string | null;
  managerPermissions: ManagerPermission[];
  /** Regions a MANAGER may access. Empty = all regions (super-manager). */
  managedRegionIds: string[];
  managedRegions: ApiManagedRegion[];
  isEmailVerified: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRoleEnum;
  status?: UserStatusEnum;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface ApiUserStats {
  total: number;
  customers: number;
  admins: number;
  managers: number;
  active: number;
  inactive: number;
}

export interface ApiManagerPermissionDescriptor {
  key: ManagerPermission;
  label: string;
  description: string;
}

export interface ApiUserCreateInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Exclude<UserRoleEnum, "ADMIN">;
  managerTitle?: string;
  managerPermissions?: ManagerPermission[];
  /** Regions this manager may access. Omit/empty = all regions (super-manager). */
  managedRegionIds?: string[];
  avatar?: string;
}

export interface ApiUserUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Optional password reset. Only send it when the admin actually typed a new
   *  one — the backend re-hashes and overwrites the user's current password. */
  password?: string;
  role?: UserRoleEnum;
  managerTitle?: string;
  managerPermissions?: ManagerPermission[];
  managedRegionIds?: string[];
  avatar?: string | null;
}

export interface ApiUserRoleChangeInput {
  role: UserRoleEnum;
  managerTitle?: string;
  managerPermissions?: ManagerPermission[];
}

export const upperCaseRole = (role: UserRoleDisplay): UserRoleEnum =>
  role.toUpperCase() as UserRoleEnum;

export const upperCaseStatus = (status: UserStatusDisplay): UserStatusEnum =>
  status.toUpperCase() as UserStatusEnum;
