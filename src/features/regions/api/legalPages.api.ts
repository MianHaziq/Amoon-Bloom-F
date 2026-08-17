import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { ApiLegalPage, ApiPublicLegalPage, LegalPageUpsertInput } from "../types";

export const legalPagesApi = {
  /**
   * Public: fetch a single published legal page for a region. `region` is a
   * region CODE (e.g. UAE, SA); `slug` is a URL segment (terms, privacy, …).
   * The backend 404s when the page isn't published or has no content — callers
   * handle that (see catalogCache.getCachedLegalPage → null).
   */
  async getPublic(regionCode: string, slug: string): Promise<ApiPublicLegalPage> {
    const { data } = await http.get<ApiResponse<ApiPublicLegalPage>>(
      `/legal-pages/${encodeURIComponent(regionCode)}/${encodeURIComponent(slug)}`
    );
    return data.data;
  },

  // --- Admin / Manager (REGIONS) ---
  async listForRegion(regionId: string): Promise<ApiLegalPage[]> {
    const { data } = await http.get<PaginatedResponse<ApiLegalPage>>("/legal-pages", {
      params: { regionId },
    });
    return data.data;
  },

  async upsert(regionId: string, slug: string, payload: LegalPageUpsertInput): Promise<ApiLegalPage> {
    const { data } = await http.put<ApiResponse<ApiLegalPage>>(
      `/legal-pages/${regionId}/${encodeURIComponent(slug)}`,
      payload
    );
    return data.data;
  },

  async remove(regionId: string, slug: string): Promise<void> {
    await http.delete(`/legal-pages/${regionId}/${encodeURIComponent(slug)}`);
  },
};
