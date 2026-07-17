/**
 * Ask the Next.js server to expire storefront catalog caches after an admin
 * edit, so changes (section order, product publish, banners, etc.) show on the
 * storefront immediately instead of after the cache TTL.
 *
 * Fire-and-forget: never blocks or throws into the caller's mutation flow.
 *
 * @param tags Which cache tags to expire. Omit to expire all catalog tags.
 */
export function revalidateCatalog(
  tags?: Array<"products" | "categories" | "sections" | "banners" | "regions">
): void {
  try {
    void fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tags ? { tags } : {}),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore — revalidation is best-effort.
  }
}
