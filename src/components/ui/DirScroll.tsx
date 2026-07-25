"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useT } from "@/i18n/useT";

/**
 * Horizontal scroll container that rebuilds itself when the writing direction
 * flips (EN ⇄ AR).
 *
 * Why this exists: iOS Safari (WebKit) does not re-resolve the scroll origin of
 * an already-mounted `overflow-x` container when the ancestor `<html dir>`
 * changes on a live language switch — it keeps the stale LTR/RTL scroll start
 * (and snap alignment) until the DOM node is rebuilt, which only happened on a
 * full refresh. Blink (Android / desktop Chrome) reflows the container
 * correctly, which is why the bug was iOS-only.
 *
 * Keying the element on `dir` forces React to unmount and remount the scroller
 * so WebKit establishes a fresh scroll container under the new direction — no
 * refresh needed. Same trick the marquee strips already use (see
 * TrustStripMarquee / AnnouncementBar).
 *
 * Server components can render this and pass their (server-rendered) children
 * through untouched; only the scroller wrapper becomes client.
 */
export function DirScroll({
  children,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  const { dir } = useT();
  return (
    <div key={dir} {...rest}>
      {children}
    </div>
  );
}
