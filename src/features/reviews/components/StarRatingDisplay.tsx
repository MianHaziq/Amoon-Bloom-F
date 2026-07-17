import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface StarRatingDisplayProps {
  rating: number;
  size?: number;
  className?: string;
}

/** Read-only row of 5 stars, filled up to the nearest whole star. */
export function StarRatingDisplay({ rating, size = 16, className }: StarRatingDisplayProps) {
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          size={size}
          className={n <= rounded ? "text-(--color-gold-500)" : "text-ink-200"}
        />
      ))}
    </div>
  );
}
