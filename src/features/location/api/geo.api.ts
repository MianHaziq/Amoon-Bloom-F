import { http } from "@/services/http";
import type { ApiResponse } from "@/types";

/** Result of `GET /geo/detect` — best-effort, country-only IP geolocation used
 *  to pre-select the storefront region for a first-time visitor. `regionCode`
 *  is null when the detected country has no configured (active) region. */
export interface GeoDetectResult {
  detected: boolean;
  countryCode: string | null;
  country?: string | null;
  city?: string | null;
  regionCode: string | null;
  isSupported: boolean;
}

export const geoApi = {
  /**
   * Detect the caller's country and matching region from their IP. Never used
   * to hard-switch — callers pre-select and let the visitor confirm. Callers
   * should treat a rejection / null regionCode as "keep default + prompt".
   */
  async detect(): Promise<GeoDetectResult> {
    const { data } = await http.get<ApiResponse<GeoDetectResult>>("/geo/detect");
    return data.data;
  },
};
