"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useT } from "@/i18n/useT";
import type { CategoryGroup } from "@/features/categories/types";

interface MegaMenuProps {
  className?: string;
}

export function MegaMenu({ className }: MegaMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { groups } = useCategories();
  const { t } = useT();

  return (
    <nav
      className={cn("relative flex items-center gap-1", className)}
      onMouseLeave={() => setActiveId(null)}
    >
      {/* Standalone Shop link — goes straight to the full catalogue, separate
          from the categories dropdown beside it. */}
      <Link
        href={ROUTES.shop}
        onMouseEnter={() => setActiveId(null)}
        className="group rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-bloom-600"
      >
        <AnimatedLabel>{t("common.shop")}</AnimatedLabel>
      </Link>
      {groups.map((group) => (
        <MegaMenuTrigger
          key={group.id}
          group={group}
          isActive={activeId === group.id}
          onActivate={() => setActiveId(group.id)}
        />
      ))}
      <Link
        href="/about"
        className="group rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-bloom-600"
      >
        <AnimatedLabel>{t("nav.ourStory")}</AnimatedLabel>
      </Link>
      <Link
        href="/contact"
        className="group rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-bloom-600"
      >
        <AnimatedLabel>{t("nav.contact")}</AnimatedLabel>
      </Link>
    </nav>
  );
}

/**
 * Nav-link label: on hover the text lifts slightly and a hairline underline
 * expands outward from its center. `active` drives the same state
 * imperatively for the categories trigger, whose "hover" is really the
 * mega-menu panel's open state (tracked in JS, not CSS :hover).
 */
function AnimatedLabel({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-block transition-transform duration-300 ease-out-soft",
        active ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-center bg-bloom-600 transition-transform duration-300 ease-out-soft",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
      />
    </span>
  );
}

function MegaMenuTrigger({
  group,
  isActive,
  onActivate,
}: {
  group: CategoryGroup;
  isActive: boolean;
  onActivate: () => void;
}) {
  const { t } = useT();
  return (
    <div onMouseEnter={onActivate} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive ? "text-bloom-600" : "text-ink-700 hover:text-bloom-600"
        )}
        aria-expanded={isActive}
      >
        <AnimatedLabel active={isActive}>
          {group.id === "shop" ? t("nav.categories") : group.label}
        </AnimatedLabel>
        <ChevronDown
          size={14}
          className={cn("transition-transform", isActive && "rotate-180")}
        />
      </button>

      {isActive && <MegaMenuPanel group={group} />}
    </div>
  );
}

function MegaMenuPanel({ group }: { group: CategoryGroup }) {
  const { t, tc } = useT();
  return (
    // Left-anchored to the trigger (the "Shop" item sits near the left of the
    // nav) and width-capped to the viewport, so the panel never clips off
    // either edge on any desktop width.
    <div
      className="absolute inset-s-0 top-full z-50 w-[min(38rem,calc(100vw-3rem))] pt-3 animate-fade-in-up"
      role="region"
      aria-label={`${group.label} menu`}
    >
      <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-(--shadow-lift)">
        <div className="grid grid-cols-2 gap-1.5">
          {group.categories.map((cat) => {
            const realImage = cat.image.url.startsWith("http")
              ? cat.image.url
              : null;
            return (
              <Link
                key={cat.id}
                href={ROUTES.category(cat.slug)}
                className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-cream-50"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {realImage ? (
                    <Image
                      src={realImage}
                      alt={cat.title}
                      fill
                      sizes="44px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-linear-to-br from-bloom-400 to-bloom-700 font-display text-lg text-white">
                      {cat.title.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-medium text-ink-900">
                    {cat.title}
                  </p>
                  {cat.productCount ? (
                    <p className="mt-0.5 text-xs text-ink-400">
                      {tc(cat.productCount, "units.pieceOne", "units.pieceOther")}
                    </p>
                  ) : null}
                </div>
                <ArrowRight
                  size={15}
                  className="shrink-0 text-ink-300 transition-all ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:text-bloom-600 rtl:-scale-x-100"
                />
              </Link>
            );
          })}
        </div>

        <Link
          href={ROUTES.shop}
          className="mt-2 flex items-center justify-between rounded-2xl bg-cream-50 px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-cream-100"
        >
          {t("nav.shopEverything")}
          <ArrowRight size={16} className="text-bloom-600 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
