import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type { User } from "../types";

export type DevicePlatform = "IOS" | "ANDROID" | "WEB";

export interface NotificationPreferences {
  orderStatus: boolean;
  promotions: boolean;
  announcements: boolean;
  updatedAt?: string;
}

export interface ProfileAddressInput {
  addressCountry?: string;
  addressCity?: string;
}

/**
 * `/user/*` endpoints — operate on the logged-in user's own profile.
 * Distinct from `/users/*` (admin user-management).
 */
export const profileApi = {
  async get(): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>("/user/profile");
    return data.data;
  },

  async setPreferredLanguage(preferredLanguage: string): Promise<{ preferredLanguage: string }> {
    const { data } = await http.patch<ApiResponse<{ preferredLanguage: string }>>(
      "/user/profile/preferred-language",
      { preferredLanguage }
    );
    return data.data;
  },

  async setPhone(phone: string): Promise<{ phone: string }> {
    const { data } = await http.patch<ApiResponse<{ phone: string }>>(
      "/user/profile/phone",
      { phone }
    );
    return data.data;
  },

  async setAddress(payload: ProfileAddressInput): Promise<ProfileAddressInput> {
    const { data } = await http.patch<ApiResponse<ProfileAddressInput>>(
      "/user/profile/address",
      payload
    );
    return data.data;
  },

  async registerPushToken(
    fcmToken: string,
    platform: DevicePlatform = "WEB"
  ): Promise<void> {
    await http.post("/user/push/token", { fcmToken, platform });
  },

  async removePushToken(fcmToken: string): Promise<void> {
    await http.delete("/user/push/token", { data: { fcmToken } });
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data } = await http.get<ApiResponse<NotificationPreferences>>(
      "/user/notifications/preferences"
    );
    return data.data;
  },

  async updateNotificationPreferences(
    payload: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const { data } = await http.patch<ApiResponse<NotificationPreferences>>(
      "/user/notifications/preferences",
      payload
    );
    return data.data;
  },
};
