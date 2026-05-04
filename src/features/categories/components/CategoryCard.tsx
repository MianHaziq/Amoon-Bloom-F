import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import type { Category } from "../types";

interface CategoryCardProps {
  category: Category;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const sizeMap = {
  sm: "aspect-[4/5]",
  md: "aspect-[3/4]",
  lg: "aspect-[4/5]",
} as const;

export function CategoryCard({
  category,
  className,
  size = "md",
  priority,
}: CategoryCardProps) {
  return (
    <Link
      href={ROUTES.category(category.slug)}
      className={cn(
        "group relative flex overflow-hidden rounded-3xl bg-cream-100",
        sizeMap[size],
        className
      )}
    >
      <Image
        src={category.image.url}
        alt={category.image.alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink-900/65 via-ink-900/15 to-transparent" />
      <div className="relative z-10 mt-auto w-full p-6 text-white">
        {category.tagline && (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/85">
            {category.tagline}
          </p>
        )}
        <div className="mt-2 flex items-end justify-between gap-3">
          <h3 className="font-display text-3xl font-medium leading-tight md:text-4xl">
            {category.title}
          </h3>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-ink-900">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
