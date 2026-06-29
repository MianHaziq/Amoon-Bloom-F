import { cookies } from "next/headers";
import { REGION_COOKIE } from "@/features/location/region";

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
