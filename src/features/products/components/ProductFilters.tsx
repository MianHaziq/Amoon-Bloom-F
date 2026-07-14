"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { CurrencyAmount } from "@/components/ui";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { PriceRangeSlider } from "./PriceRangeSlider";
import type { ProductFilter } from "../types";
import { BEST_SELLING_FILTER_VALUE, type ColorFacet, type PriceBounds } from "../facets";
import type { Category } from "@/features/categories/types";
import { useT } from "@/i18n/useT";

interface ProductFiltersProps {
  filter: ProductFilter;
  onChange: (next: ProductFilter) => void;
  resultCount: number;
  categories: Category[];
  colorFacets: ColorFacet[];
  priceBounds: PriceBounds | null;
  className?: string;
}

/** Shared eyebrow heading for each facet block. */
function FacetHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
      {children}
    </p>
  );
}

export function ProductFilters({
  filter,
  onChange,
  resultCount,
  categories,
  colorFacets,
  priceBounds,
  className,
}: ProductFiltersProps) {
  const stockId = useId();
  const { t } = useT();
  const { currency, locale } = useCurrency();

  const selectedColors = filter.colors ?? [];
  const priceValue = priceBounds
    ? {
        min: filter.minPrice ?? priceBounds.min,
        max: filter.maxPrice ?? priceBounds.max,
      }
    : { min: 0, max: 0 };

  const toggleColor = (value: string) => {
    const next = selectedColors.includes(value)
      ? selectedColors.filter((c) => c !== value)
      : [...selectedColors, value];
    onChange({ ...filter, colors: next.length ? next : undefined });
  };

  const bestSellingActive = filter.category === BEST_SELLING_FILTER_VALUE;

  return (
    <div
      className={cn(
        "flex flex-col gap-7 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pe-1 no-scrollbar",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
        {t("shop.filters")}
      </p>

      {/* Category */}
      <div className="flex flex-col gap-2.5">
        <FacetHeading>{t("shop.category")}</FacetHeading>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...filter, category: undefined })}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
              !filter.category
                ? "bg-bloom-50 font-semibold text-bloom-700"
                : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
            )}
          >
            <span>{t("shop.everything")}</span>
            <span
              className={cn(
                "text-xs tabular-nums",
                !filter.category ? "text-bloom-500" : "text-ink-400"
              )}
            >
              {resultCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filter,
                category: bestSellingActive ? undefined : BEST_SELLING_FILTER_VALUE,
              })
            }
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
              bestSellingActive
                ? "bg-bloom-50 font-semibold text-bloom-700"
                : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
            )}
          >
            <span>{t("shop.bestSelling")}</span>
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
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
                  active
                    ? "bg-bloom-50 font-semibold text-bloom-700"
                    : "text-ink-600 hover:bg-cream-50 hover:text-ink-900"
                )}
              >
                <span>{cat.title}</span>
                {typeof cat.productCount === "number" && (
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      active ? "text-bloom-500" : "text-ink-400"
                    )}
                  >
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      {priceBounds && (
        <div className="flex flex-col gap-3.5 border-t border-ink-100 pt-6">
          <FacetHeading>{t("shop.price")}</FacetHeading>
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            value={priceValue}
            onChange={({ min, max }) =>
              onChange({
                ...filter,
                minPrice: min <= priceBounds.min ? undefined : min,
                maxPrice: max >= priceBounds.max ? undefined : max,
              })
            }
            format={(a) => <CurrencyAmount amount={a} currency={currency} locale={locale} />}
          />
        </div>
      )}

      {/* Colour */}
      {colorFacets.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-ink-100 pt-6">
          <FacetHeading>{t("shop.color")}</FacetHeading>
          <div className="flex flex-col gap-1.5">
            {colorFacets.map((c) => {
              const active = selectedColors.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleColor(c.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-start text-sm transition-colors",
                    active
                      ? "bg-cream-100 font-semibold text-ink-900"
                      : "text-ink-600 hover:bg-cream-50"
                  )}
                >
                  <span
                    className={cn(
                      "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-shadow",
                      c.needsRing ? "ring-ink-200" : "ring-black/10",
                      active && "shadow-[0_0_0_2px_var(--color-bloom-500)]"
                    )}
                    style={
                      c.swatch
                        ? { background: c.swatch }
                        : { background: "var(--color-ink-100)" }
                    }
                  >
                    {!c.swatch && (
                      <span className="text-[10px] font-semibold uppercase text-ink-500">
                        {c.value.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="flex-1 capitalize">{c.value}</span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      active ? "text-ink-500" : "text-ink-400"
                    )}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="flex flex-col gap-3 border-t border-ink-100 pt-6">
        <FacetHeading>{t("shop.availability")}</FacetHeading>
        <label
          htmlFor={stockId}
          className="flex cursor-pointer items-center justify-between gap-3 text-sm text-ink-700"
        >
          <span>{t("shop.inStockOnly")}</span>
          <span className="relative inline-flex">
            <input
              id={stockId}
              type="checkbox"
              className="peer sr-only"
              checked={filter.inStock ?? false}
              onChange={(e) =>
                onChange({ ...filter, inStock: e.target.checked || undefined })
              }
            />
            <span className="h-6 w-10 rounded-full bg-ink-200 transition-colors peer-checked:bg-bloom-500 peer-focus-visible:ring-4 peer-focus-visible:ring-bloom-100" />
            <span className="absolute inset-s-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
          </span>
        </label>
      </div>
    </div>
  );
}
