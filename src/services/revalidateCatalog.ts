/**
 * Ask the Next.js server to expire storefront catalog caches after an admin
 * edit, so changes (section order, product publish, banners, etc.) show on the
 * storefront immediately instead of after the cache TTL.
 *
 * Fire-and-forget: never blocks or throws into the caller's mutation flow.
 *
 * @param tags Which cache tags to expire. Omit to expire all catalog tags.
 */
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/lib/storage";

export function revalidateCatalog(
  tags?: Array<"products" | "categories" | "sections" | "banners" | "regions">
): void {
  try {
    // Forward the admin/manager token so the route can authorize the request — the
    // endpoint rejects anonymous callers to prevent cache-bust abuse.
    const token = storage.get<string>(STORAGE_KEYS.authToken);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    void fetch("/api/revalidate", {
      method: "POST",
      headers,
      body: JSON.stringify(tags ? { tags } : {}),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore — revalidation is best-effort.
  }
}
