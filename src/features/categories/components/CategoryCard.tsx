import Image from "next/image";
import Link from "next/link";
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
}: CategoryCardProps) {
  // Only real (remote) images render via next/image; the adapter's local
  // placeholder is treated as "no image" so we fall back gracefully.
  const realImage = category.image.url.startsWith("http")
    ? category.image.url
    : null;
  const src = realImage ?? fallbackImage ?? null;

  return (
    <Link
      href={ROUTES.category(category.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)",
        className
      )}
    >
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
      </div>
      <div className="border-t border-ink-100 px-4 py-4 text-center">
        <h3 className="font-display text-base font-medium text-ink-900 transition-colors group-hover:text-bloom-700 sm:text-lg">
          {category.title}
        </h3>
      </div>
    </Link>
  );
}
