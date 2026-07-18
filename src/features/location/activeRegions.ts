import { DEFAULT_REGION_CODE } from "./region";
import type { ApiRegion } from "@/features/regions/types";

export interface DerivedActiveRegions {
  /** Codes of every currently-active region (admin-controlled). */
  activeRegions: string[];
  /** Fallback region code for a visitor whose current region is no longer active. */
  defaultCountry: string;
}

/**
 * Single source of truth for turning the backend's region list into what the
 * storefront picker needs: which region codes are currently selectable, and
 * which one to silently fall back to. Used both by the SSR seed
 * (`app/layout.tsx`) and the client-side refocus check (`LocationPersistence`)
 * so the derivation logic exists in exactly one place.
 */
export function deriveActiveRegions(apiRegions: ApiRegion[]): DerivedActiveRegions {
  const active = apiRegions.filter((r) => r.isActive);
  const activeRegions = active.map((r) => r.code);
  const defaultRegion = active.find((r) => r.isDefault) ?? active[0];
  const defaultCountry = defaultRegion?.code ?? DEFAULT_REGION_CODE;
  return { activeRegions, defaultCountry };
}
