import { GlobeIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { ApiRegion } from "@/features/regions/types";

/**
 * Flag image keyed by the region's admin-set `iso2`, self-hosted from
 * `/public/flags` (vendored from the MIT-licensed HatScripts/circle-flags
 * set — see `/public/flags/NOTICE.md`). These SVGs are purpose-drawn for a
 * circular frame, unlike flagcdn.com's rectangular flags (which look cropped/
 * distorted when force-fit into a circle via object-cover). Self-hosting also
 * means any admin-added region's flag renders reliably with no third-party
 * CDN dependency. Works for any ISO 3166-1 alpha-2 code, unlike per-country JS
 * flag imports (country-flag-icons), which only cover a fixed compile-time
 * list. Falls back to a neutral globe glyph for a region without a flag set,
 * or an iso2 with no matching file.
 */
export function RegionFlag({
  region,
  className,
  shape = "rounded",
}: {
  region: Pick<ApiRegion, "iso2" | "name"> | undefined;
  className?: string;
  shape?: "rounded" | "circle";
}) {
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";
  if (!region?.iso2) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-ink-100 text-ink-400 ring-1 ring-ink-900/10",
          shapeClass,
          className
        )}
      >
        <GlobeIcon size={16} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden ring-1 ring-ink-900/10", shapeClass, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/flags/${region.iso2.toLowerCase()}.svg`}
        alt={region.name}
        className="h-full w-full object-cover"
        onError={(e) => {
          // No local asset for this code (shouldn't happen for a real ISO2 —
          // defensive only) — hide the broken image, the ring/bg still reads
          // as a placeholder swatch.
          e.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}
