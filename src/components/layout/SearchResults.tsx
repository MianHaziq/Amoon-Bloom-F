"use client";

import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { ArrowRight, SearchIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { useT } from "@/i18n/useT";
import type { Product } from "@/features/products/types";

interface SearchResultsProps {
  /** Whether the term is long enough that a search is running. */
  active: boolean;
  term: string;
  products: Product[];
  total: number;
  isLoading: boolean;
  /** Called when the user navigates away (clicks a result or "see all") — the
   *  caller closes the dropdown/overlay. */
  onNavigate: () => void;
  /** Larger touch targets for the mobile overlay. */
  size?: "sm" | "md";
}

/**
 * Shared type-ahead results body used by both the desktop header dropdown and
 * the mobile search overlay. Renders one of: idle hint, spinner, "no matches",
 * or the product rows + a "see all results" link to the full /shop?q= page.
 */
export function SearchResults({
  active,
  term,
  products,
  total,
  isLoading,
  onNavigate,
  size = "sm",
}: SearchResultsProps) {
  const { t } = useT();
  const { currency, locale } = useCurrency();

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <SearchIcon size={22} className="text-ink-300" />
        <p className="text-sm text-ink-400">{t("nav.searchHint")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-ink-400">
        <Spinner size="sm" />
        {t("common.loading")}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm font-medium text-ink-900">
          {t("nav.searchNoResults")}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          {t("nav.searchNoResultsHint", { term })}
        </p>
      </div>
    );
  }

  const rowPad = size === "md" ? "gap-4 p-3" : "gap-3 p-2";
  const thumb = size === "md" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={ROUTES.product(p.slug)}
              onClick={onNavigate}
              className={`flex items-center rounded-xl ${rowPad} transition-colors hover:bg-cream-100`}
            >
              <span
                className={`relative ${thumb} shrink-0 overflow-hidden rounded-lg bg-cream-100`}
              >
                {p.images[0] && (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt || p.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1 ps-3">
                {p.category && (
                  <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-bloom-700">
                    {p.category}
                  </span>
                )}
                <span className="block truncate text-sm font-medium text-ink-900">
                  {p.title}
                </span>
                <CurrencyAmount
                  amount={p.price.amount}
                  currency={currency}
                  locale={locale}
                  className="mt-0.5 block text-sm font-semibold text-bloom-700"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={`${ROUTES.shop}?q=${encodeURIComponent(term)}`}
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 border-t border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900 transition-colors hover:text-bloom-700"
      >
        {t("nav.searchViewAll", { total })}
        <ArrowRight size={15} className="rtl:-scale-x-100" />
      </Link>
    </div>
  );
}
