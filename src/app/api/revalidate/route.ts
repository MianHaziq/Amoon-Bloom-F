import { revalidateTag } from "next/cache";

/**
 * On-demand revalidation for the storefront Data Cache.
 *
 * Admin edits (sections, products, categories, banners) mutate the backend
 * directly, so the Next.js `unstable_cache` layer (see `services/catalogCache`)
 * wouldn't otherwise notice and could serve stale content for up to its TTL.
 * The admin panel POSTs here after a successful mutation to expire the relevant
 * tag(s) immediately, so the next storefront request reflects the change.
 *
 * `{ expire: 0 }` = immediate expiration — the recommended form when an external
 * trigger (our admin action) needs the change visible right away (Next 16).
 */
const ALLOWED = ["products", "categories", "sections", "banners"] as const;

export async function POST(request: Request) {
  let requested: string[] | null = null;
  try {
    const body = await request.json();
    if (Array.isArray(body?.tags)) requested = body.tags.map(String);
  } catch {
    // No/invalid body → revalidate everything below.
  }

  const tags = (requested ?? ALLOWED).filter((t): t is (typeof ALLOWED)[number] =>
    (ALLOWED as readonly string[]).includes(t)
  );
  const toRevalidate = tags.length > 0 ? tags : [...ALLOWED];

  for (const tag of toRevalidate) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: toRevalidate });
}
