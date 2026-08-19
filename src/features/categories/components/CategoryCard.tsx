import Image from "next/image";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import type { Category } from "../types";

interface CategoryCardProps {
  category: Category;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  /** Representative image used when the category has no image of its own. */
  fallbackImage?: string;
  /** Localized "Coming soon" label — passed in because this is a server component
   *  with no access to the i18n hook. When set + category.comingSoon, shows an overlay. */
  comingSoonLabel?: string;
}

/**
 * Category card — clean, professional layout matching the client's site: the
 * product photo sits fully visible on a light background (never cropped or
 * darkened), with the category name in a tidy strip below. A uniform square
 * image area keeps the whole row perfectly aligned.
 */
export function CategoryCard({
  category,
  className,
  priority,
  fallbackImage,
  comingSoonLabel,
}: CategoryCardProps) {
  // Only real (remote) images render via next/image; the adapter's local
  // placeholder is treated as "no image" so we fall back gracefully.
  const realImage = category.image.url.startsWith("http")
    ? category.image.url
    : null;
  const src = realImage ?? fallbackImage ?? null;

  // A coming-soon category is a teaser only — it still shows on the home/shop grid
  // (with its overlay) but is NOT clickable: no link, no hover-lift, default cursor.
  const isComingSoon = Boolean(category.comingSoon);

  const inner = (
    <>
      <div className="relative aspect-square w-full bg-cream-50">
        {src ? (
          <Image
            src={src}
            alt={category.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3 transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-bloom-400 to-bloom-700">
            <span className="select-none font-display text-6xl text-white/90">
              {category.title.charAt(0)}
            </span>
          </div>
        )}
        {category.comingSoon && comingSoonLabel && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-900/30 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-900 shadow-md">
              {comingSoonLabel}
            </span>
          </div>
        )}
      </div>
      <div className="border-t border-ink-100 px-4 py-4 text-center">
        <h3 className="font-display text-base font-medium text-ink-900 transition-colors group-hover:text-bloom-700 sm:text-lg">
          {category.title}
        </h3>
      </div>
    </>
  );

  const baseClass =
    "group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-(--shadow-soft)";

  if (isComingSoon) {
    return (
      <div className={cn(baseClass, "cursor-default", className)} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <LocalizedLink
      href={ROUTES.category(category.slug)}
      className={cn(
        baseClass,
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)",
        className
      )}
    >
      {inner}
    </LocalizedLink>
  );
}
