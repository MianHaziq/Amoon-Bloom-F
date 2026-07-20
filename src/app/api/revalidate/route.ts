import { revalidateTag } from "next/cache";

/**
 * On-demand revalidation for the storefront Data Cache.
 *
 * Admin edits (sections, products, categories, banners, regions) mutate the backend
 * directly, so the Next.js `unstable_cache` layer (see `services/catalogCache`)
 * wouldn't otherwise notice and could serve stale content for up to its TTL.
 * The admin panel POSTs here after a successful mutation to expire the relevant
 * tag(s) immediately, so the next storefront request reflects the change.
 *
 * `{ expire: 0 }` = immediate expiration — the recommended form when an external
 * trigger (our admin action) needs the change visible right away (Next 16).
 */
const ALLOWED = ["products", "categories", "sections", "banners", "regions"] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const STAFF_ROLES = new Set(["ADMIN", "MANAGER"]);

/**
 * This endpoint is called from the admin browser after a mutation, so it must not be
 * open to the public — an anonymous caller could otherwise hammer it to bust the
 * storefront cache and amplify load onto the backend. We authorize by forwarding the
 * caller's admin/manager Bearer token to the backend (the source of truth for roles)
 * and only proceeding for a genuine staff account. No secret is shared with the client.
 */
async function isStaffRequest(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    const role = body?.data?.role;
    return typeof role === "string" && STAFF_ROLES.has(role.toUpperCase());
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isStaffRequest(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
