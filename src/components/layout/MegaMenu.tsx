"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { categoryGroups } from "@/features/categories/data/categories.mock";
import type { CategoryGroup } from "@/features/categories/types";

interface MegaMenuProps {
  className?: string;
}

export function MegaMenu({ className }: MegaMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <nav
      className={cn("relative flex items-center gap-1", className)}
      onMouseLeave={() => setActiveId(null)}
    >
      {categoryGroups.map((group) => (
        <MegaMenuTrigger
          key={group.id}
          group={group}
          isActive={activeId === group.id}
          onActivate={() => setActiveId(group.id)}
        />
      ))}
      <Link
        href="/about"
        className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
      >
        Our story
      </Link>
      <Link
        href="/contact"
        className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
      >
        Contact
      </Link>
    </nav>
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
  return (
    <div onMouseEnter={onActivate} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive ? "text-bloom-700" : "text-ink-700 hover:text-ink-900"
        )}
        aria-expanded={isActive}
      >
        {group.label}
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
  return (
    <div
      className="absolute left-1/2 top-full z-50 w-screen max-w-[64rem] -translate-x-1/2 pt-3 animate-fade-in-up"
      role="region"
      aria-label={`${group.label} menu`}
    >
      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-(--shadow-lift)">
        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: category list */}
          <div className="grid grid-cols-2 gap-3">
            {group.categories.map((cat) => (
              <Link
                key={cat.id}
                href={ROUTES.category(cat.slug)}
                className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-cream-50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  <Image
                    src={cat.image.url}
                    alt={cat.image.alt}
                    fill
                    sizes="56px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-medium text-ink-900">
                    {cat.title}
                  </p>
                  {cat.tagline && (
                    <p className="mt-0.5 text-xs text-ink-500">{cat.tagline}</p>
                  )}
                </div>
                <ArrowRight
                  size={16}
                  className="ml-auto text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-bloom-600"
                />
              </Link>
            ))}
          </div>

          {/* Right: featured highlight */}
          {group.highlight && (
            <Link
              href={group.highlight.href}
              className="group relative block overflow-hidden rounded-2xl bg-blush-50"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={group.highlight.image.url}
                  alt={group.highlight.image.alt}
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-900/55 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 text-white">
                <p className="font-display text-2xl font-medium">
                  {group.highlight.title}
                </p>
                <p className="max-w-xs text-sm text-white/85">
                  {group.highlight.description}
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                  {group.highlight.cta}
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
