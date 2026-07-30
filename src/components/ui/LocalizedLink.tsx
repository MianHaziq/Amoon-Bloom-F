"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useLocalizedHref } from "@/features/location/useLocalizedHref";

type LinkProps = ComponentPropsWithoutRef<typeof Link>;

/**
 * Drop-in replacement for `next/link` that automatically prefixes a string
 * `href` with the active `/:regionSlug/:locale` so internal navigation keeps the
 * visitor inside their region + language. Use this for every INTERNAL storefront
 * link. External URLs, `mailto:`, and `#hash` pass through untouched; object
 * (`UrlObject`) hrefs are left as-is. Admin links keep using plain `next/link`.
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const localize = useLocalizedHref();
    const resolved = typeof href === "string" ? localize(href) : href;
    return <Link ref={ref} href={resolved} {...props} />;
  }
);
