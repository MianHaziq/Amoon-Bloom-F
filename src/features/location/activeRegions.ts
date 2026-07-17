import { COUNTRIES, DEFAULT_COUNTRY, type CountryCode } from "./data";
import type { ApiRegion } from "@/features/regions/types";

export interface ActiveRegionEntry {
  code: string;
  country: CountryCode;
}

export interface DerivedActiveRegions {
  activeRegions: ActiveRegionEntry[];
  defaultCountry: CountryCode;
}

/**
 * Single source of truth for turning the backend's active-region list into
 * what the storefront picker needs: which static `COUNTRIES` entries are
 * currently selectable, and which one to silently fall back to. Used both by
 * the SSR seed (`app/layout.tsx`) and the client-side refocus check
 * (`LocationPersistence`) so the derivation logic exists in exactly one place.
 */
export function deriveActiveRegions(apiRegions: ApiRegion[]): DerivedActiveRegions {
  const active = apiRegions.filter((r) => r.isActive);
  const activeCodes = new Set(active.map((r) => r.code));
  const activeRegions = COUNTRIES.filter((c) => activeCodes.has(c.regionCode)).map((c) => ({
    code: c.regionCode,
    country: c.code,
  }));

  const defaultRegion = active.find((r) => r.isDefault) ?? active[0];
  const defaultCountry =
    COUNTRIES.find((c) => c.regionCode === defaultRegion?.code)?.code ?? DEFAULT_COUNTRY;

  return { activeRegions, defaultCountry };
}
