import { http } from "@/services/http";
import type { ApiResponse } from "@/types";

export type UploadPath = "products" | "uploads" | "team" | "testimonials";

export interface UploadResult {
  url: string;
}

/**
 * Image upload to Bunny CDN via the backend `/upload/image` endpoint.
 * Multipart form-data, max 5MB, image MIME types only. Admin / manager
 * (with PRODUCTS, CATEGORIES, SECTIONS, or BANNERS permission) only.
 */
export const uploadsApi = {
  async image(file: File, path: UploadPath = "uploads"): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<ApiResponse<UploadResult>>(
      "/upload/image",
      form,
      {
        params: { path },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.data.url;
  },

  /**
   * Video upload to Bunny CDN via the backend `/upload/video` endpoint.
   * Multipart form-data, up to 500MB, video MIME types only (MP4/WebM/MOV/AVI/MKV).
   * Used for web hero banner videos.
   */
  async video(file: File, path: UploadPath = "uploads"): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<ApiResponse<UploadResult>>(
      "/upload/video",
      form,
      {
        params: { path },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.data.url;
  },
};
