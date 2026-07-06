"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type { ProductDescriptionBlock, ProductOptionGroup } from "../types";

interface ProductTabsProps {
  description?: string;
  descriptions?: ProductDescriptionBlock[];
  options?: ProductOptionGroup[];
  category?: string;
}

/**
 * Product detail tabs — mirrors the client's PDP: Description · Additional
 * information · Reviews. Description renders the full copy (line breaks kept so
 * "Includes:" bullet lists show); Additional information is a spec table of the
 * product's option groups + category.
 */
export function ProductTabs({
  description,
  descriptions,
  options,
  category,
}: ProductTabsProps) {
  const { t } = useT();

  const blocks = (descriptions ?? []).filter((d) => d.description?.trim());
  const hasDescription = Boolean(description?.trim()) || blocks.length > 0;
  const specs: { label: string; value: string }[] = [
    ...(category ? [{ label: t("shop.category"), value: category }] : []),
    ...(options ?? [])
      .filter((o) => o.options?.length)
      .map((o) => ({ label: o.title, value: o.options.join(", ") })),
  ];

  const tabs = [
    hasDescription && { id: "description", label: t("product.tabDescription") },
    specs.length > 0 && { id: "info", label: t("product.tabInfo") },
    { id: "reviews", label: `${t("product.tabReviews")} (0)` },
  ].filter(Boolean) as { id: string; label: string }[];

  const [active, setActive] = useState(tabs[0]?.id ?? "reviews");
  if (tabs.length === 0) return null;

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink-100"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative -mb-px pb-3 text-sm font-semibold tracking-tight transition-colors sm:text-base",
                isActive
                  ? "text-ink-900"
                  : "text-ink-400 hover:text-ink-700"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-bloom-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="pt-6">
        {active === "description" && (
          <div className="max-w-3xl space-y-5">
            {blocks.length > 0
              ? blocks.map((d) => (
                  <div key={d.id}>
                    {d.title && (
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-bloom-700">
                        {d.title}
                      </p>
                    )}
                    <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">
                      {d.description}
                    </p>
                  </div>
                ))
              : description?.trim() && (
                  <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">
                    {description}
                  </p>
                )}
          </div>
        )}

        {active === "info" && (
          <div className="max-w-2xl overflow-hidden rounded-2xl border border-ink-100">
            <table className="w-full text-sm">
              <tbody>
                {specs.map((s, i) => (
                  <tr
                    key={s.label}
                    className={cn(i % 2 === 1 && "bg-cream-50")}
                  >
                    <th
                      scope="row"
                      className="w-1/3 px-4 py-3 text-start align-top font-medium text-ink-900"
                    >
                      {s.label}
                    </th>
                    <td className="px-4 py-3 text-ink-600">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === "reviews" && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50 px-6 py-10 text-center">
            <p className="font-display text-lg text-ink-900">
              {t("product.noReviews")}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {t("product.noReviewsBody")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
