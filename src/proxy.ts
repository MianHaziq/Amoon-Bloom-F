import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic edge-level check for `/admin/*` and `/account/*`. This is a
 * defense-in-depth layer, not the real gate — role enforcement (ADMIN vs
 * MANAGER vs CUSTOMER) still happens client-side in `AdminShell`/
 * `AccountGuard` (which verify against the backend profile endpoint), and the
 * backend independently authorizes every request regardless of what this
 * file does. All this does is bounce a request with no session cookie at
 * all before it ever reaches those pages, per Next's documented pattern:
 * https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("amoonis.session");
  if (hasSession) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
