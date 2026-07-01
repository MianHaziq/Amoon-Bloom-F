"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { ProductFilter } from "../types";
import type { Category } from "@/features/categories/types";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";

const SORTS: {
  value: NonNullable<ProductFilter["sort"]>;
  labelKey: MessageKey;
}[] = [
  { value: "featured", labelKey: "shop.sortFeatured" },
  { value: "newest", labelKey: "shop.sortNewest" },
  { value: "price-asc", labelKey: "shop.sortPriceAsc" },
  { value: "price-desc", labelKey: "shop.sortPriceDesc" },
];

interface ProductFiltersProps {
  filter: ProductFilter;
  onChange: (next: ProductFilter) => void;
  resultCount: number;
  categories: Category[];
  className?: string;
}

export function ProductFilters({
  filter,
  onChange,
  resultCount,
  categories,
  className,
}: ProductFiltersProps) {
  const sortId = useId();
  const { t } = useT();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:sticky lg:top-24 lg:gap-6",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("shop.browse")}
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filter, category: undefined })}
            className={cn(
              "rounded-xl px-3 py-2 text-start text-sm transition-colors",
              !filter.category
                ? "bg-cream-100 font-semibold text-ink-900"
                : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
            )}
          >
            {t("shop.everything")}
            <span className="ms-2 text-ink-400">{resultCount}</span>
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
                  "rounded-xl px-3 py-2 text-start text-sm transition-colors",
                  active
                    ? "bg-cream-100 font-semibold text-ink-900"
                    : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
                )}
              >
                {cat.title}
                {cat.productCount && (
                  <span className="ms-2 text-ink-400">{cat.productCount}</span>
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
          {t("shop.sort")}
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
              {t(opt.labelKey)}
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
        {t("shop.inStockOnly")}
      </label>
    </div>
  );
}
