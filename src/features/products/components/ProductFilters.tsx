"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { ProductFilter } from "../types";
import { categories } from "@/features/categories/data/categories.mock";

const SORTS: { value: NonNullable<ProductFilter["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
];

interface ProductFiltersProps {
  filter: ProductFilter;
  onChange: (next: ProductFilter) => void;
  resultCount: number;
  className?: string;
}

export function ProductFilters({
  filter,
  onChange,
  resultCount,
  className,
}: ProductFiltersProps) {
  const sortId = useId();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:sticky lg:top-24 lg:gap-6",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          Browse
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filter, category: undefined })}
            className={cn(
              "rounded-xl px-3 py-2 text-left text-sm transition-colors",
              !filter.category
                ? "bg-cream-100 font-semibold text-ink-900"
                : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
            )}
          >
            Everything
            <span className="ml-2 text-ink-400">{resultCount}</span>
          </button>
          {categories.map((cat) => {
            const active = filter.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...filter,
                    category: active ? undefined : cat.slug,
                  })
                }
                className={cn(
                  "rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-cream-100 font-semibold text-ink-900"
                    : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
                )}
              >
                {cat.title}
                {cat.productCount && (
                  <span className="ml-2 text-ink-400">{cat.productCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={sortId}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700"
        >
          Sort
        </label>
        <select
          id={sortId}
          value={filter.sort ?? "featured"}
          onChange={(e) =>
            onChange({
              ...filter,
              sort: e.target.value as ProductFilter["sort"],
            })
          }
          className="rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
        >
          {SORTS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={filter.inStock ?? false}
          onChange={(e) =>
            onChange({ ...filter, inStock: e.target.checked || undefined })
          }
          className="h-4 w-4 rounded border-ink-300 text-bloom-600 focus:ring-bloom-300"
        />
        In stock only
      </label>
    </div>
  );
}
