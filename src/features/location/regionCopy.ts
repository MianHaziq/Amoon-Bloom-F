import type { Locale } from "@/store/slices/ui.slice";
import type { ApiRegion } from "@/features/regions/types";
import type { ApiDeliveryZone } from "@/features/delivery-zones/types";
import { getCachedRegions, getCachedDeliveryZones } from "@/services/catalogCache";
import { DEFAULT_REGION_CODE } from "./region";

export interface RegionCopy {
  city: string;
  country: string;
  countryCode: string;
}

function localizedName(
  entity: { name: string; name_ar: string | null } | undefined,
  locale: Locale
): string {
  if (!entity) return "";
  return locale === "ar" ? entity.name_ar ?? entity.name : entity.name;
}

/** Pure helper shared by the server and client resolvers below — given the
 * already-fetched region/zone lists, produce localized copy. `cityName`, when
 * provided, picks a specific zone (e.g. the visitor's actual pick); otherwise
 * the first zone (lowest sortOrder) stands in as a representative city for
 * generic marketing copy. */
function buildRegionCopy(
  regions: ApiRegion[],
  zones: ApiDeliveryZone[],
  code: string,
  cityName: string | undefined,
  locale: Locale
): RegionCopy {
  const region = regions.find((r) => r.code === code);
  const zone = cityName ? zones.find((z) => z.name === cityName) : zones[0];
  return {
    city: zone ? localizedName(zone, locale) : cityName ?? "",
    country: region ? localizedName(region, locale) : code,
    countryCode: code,
  };
}

function resolveCode(regions: ApiRegion[], regionCode: string | undefined): string {
  if (regionCode && regions.some((r) => r.code === regionCode && r.isActive)) return regionCode;
  const fallback = regions.find((r) => r.isDefault && r.isActive) ?? regions.find((r) => r.isActive);
  return fallback?.code ?? DEFAULT_REGION_CODE;
}

/**
 * Server-side: resolves localized region + representative-city copy from the
 * `region` cookie value. Regions/zones are both request-deduped and cross-
 * request cached (see `catalogCache.ts`), so calling this from many marketing
 * components in the same page render is cheap, not a fetch storm.
 */
export async function regionCopyFromRegionCode(
  regionCode: string | undefined,
  locale: Locale
): Promise<RegionCopy> {
  const regions = await getCachedRegions().catch<ApiRegion[]>(() => []);
  const code = resolveCode(regions, regionCode);
  const zones = await getCachedDeliveryZones(code).catch<ApiDeliveryZone[]>(() => []);
  return buildRegionCopy(regions, zones, code, undefined, locale);
}

/**
 * Client-side: same shape, but takes already-fetched live query data instead
 * of doing its own fetch — see `useRegionCopy()`, which supplies it from
 * `useQuery(regionsApi.list)`/`useQuery(deliveryZonesApi.list)`.
 */
export function regionCopyFromLiveData(
  regions: ApiRegion[] | undefined,
  zones: ApiDeliveryZone[] | undefined,
  code: string,
  cityName: string,
  locale: Locale
): RegionCopy {
  return buildRegionCopy(regions ?? [], zones ?? [], code, cityName, locale);
}
