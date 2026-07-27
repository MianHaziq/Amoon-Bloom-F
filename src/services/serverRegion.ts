import { cookies } from "next/headers";
import { REGION_COOKIE, ZONE_COOKIE } from "@/features/location/region";

/**
 * Server-only: reads the storefront region code from the request cookie so SSR
 * catalog fetches can scope visibility to the user's chosen region (passed as
 * `?region=` to the public list/detail endpoints). Returns undefined outside a
 * request scope (build-time / static generation) → backend uses its default
 * region. Only import this from Server Components.
 */
export async function getServerRegion(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(REGION_COOKIE)?.value || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Server-only: the selected delivery zone/city NAME from the cookie (set by
 * LocationPersistence). The product page resolves this name → zone id within the current
 * region to fetch a zone-accurate delivery-days estimate. Returns undefined outside a
 * request scope.
 */
export async function getServerZoneName(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(ZONE_COOKIE)?.value || undefined;
  } catch {
    return undefined;
  }
}
