"use client";

import { useState } from "react";
import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  label?: string;
  error?: string;
}

/** Clickable/hoverable 1-5 star picker for writing a review. Keyboard accessible
 * via a `radiogroup` of buttons — arrow keys move focus natively between them. */
export function StarRatingInput({
  value,
  onChange,
  size = 28,
  label,
  error,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-ink-900">{label}</p>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5 stars`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => onChange(n)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 rounded"
          >
            <StarIcon
              size={size}
              className={cn(
                "transition-colors",
                n <= display ? "text-(--color-gold-500)" : "text-ink-200"
              )}
            />
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
