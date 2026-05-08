import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiPublicSettings,
  ApiSettings,
  ApiSettingsUpdateInput,
} from "../types";

export const settingsApi = {
  async getPublic(): Promise<ApiPublicSettings> {
    const { data } = await http.get<ApiResponse<ApiPublicSettings>>(
      "/settings/public"
    );
    return data.data;
  },

  async get(): Promise<ApiSettings> {
    const { data } = await http.get<ApiResponse<ApiSettings>>("/settings");
    return data.data;
  },

  async update(payload: ApiSettingsUpdateInput): Promise<ApiSettings> {
    const { data } = await http.put<ApiResponse<ApiSettings>>("/settings", payload);
    return data.data;
  },
};
