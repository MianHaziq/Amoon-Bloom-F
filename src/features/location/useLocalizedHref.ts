"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  parsePrefix,
  buildPrefix,
  withPrefix,
  DEFAULT_REGION_SLUG,
  DEFAULT_LOCALE,
} from "@/features/location/routing";

/**
 * The active `/:regionSlug/:locale` route prefix, read from the current URL —
 * which is the source of truth for region + language. Falls back to the default
 * prefix on any path without one (e.g. before hydration on an odd route).
 */
export function useRoutePrefix(): string {
  const pathname = usePathname();
  const parsed = pathname ? parsePrefix(pathname) : null;
  return parsed
    ? buildPrefix(parsed.regionSlug, parsed.locale)
    : buildPrefix(DEFAULT_REGION_SLUG, DEFAULT_LOCALE);
}

/**
 * Returns a function that prefixes an app-relative path (e.g. `ROUTES.shop`)
 * with the active region/locale, so every internal link keeps the visitor
 * inside their region+language. External URLs and hashes pass through untouched.
 *
 *   const href = useLocalizedHref();
 *   <Link href={href(ROUTES.shop)}>…</Link>
 */
export function useLocalizedHref(): (path: string) => string {
  const prefix = useRoutePrefix();
  return useCallback((path: string) => withPrefix(prefix, path), [prefix]);
}

/**
 * The current pathname with the `/:region/:locale` prefix stripped (e.g.
 * `/ae/en/shop` → `/shop`, `/ae/en` → `/`). Use this for active-link
 * comparisons against unprefixed `ROUTES.*` values.
 */
export function useUnprefixedPathname(): string {
  const pathname = usePathname();
  if (!pathname) return "/";
  const parsed = parsePrefix(pathname);
  return parsed ? parsed.rest : pathname;
}
