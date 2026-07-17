"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "motion/react";
import { SearchIcon } from "@/components/icons";
import { EASE_OUT } from "@/lib/motion";
import { ROUTES } from "@/constants/routes";
import { useProductQuickSearch } from "@/features/products/hooks/useProductQuickSearch";
import { useT } from "@/i18n/useT";
import { SearchResults } from "./SearchResults";

/**
 * Desktop header search: a live type-ahead. Typing (debounced) shows matching
 * products in a dropdown anchored under the input; clicking a result opens that
 * product, and Enter / "see all" goes to the full /shop?q= results page.
 */
export function HeaderSearch() {
  const router = useRouter();
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { active, term, products, total, isLoading } =
    useProductQuickSearch(query);

  // Close the dropdown on any click outside the search container.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const goToResults = () => {
    const q = query.trim();
    router.push(q ? `${ROUTES.shop}?q=${encodeURIComponent(q)}` : ROUTES.shop);
    setOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    goToResults();
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <form role="search" onSubmit={submitSearch}>
        <label className="group flex h-11 items-center gap-3 rounded-full border border-ink-200 bg-white px-4 transition-all focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100">
          <SearchIcon size={18} className="text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={t("nav.searchPlaceholder")}
            className="h-full flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            aria-label={t("common.search")}
            aria-expanded={showPanel}
            role="combobox"
            aria-controls="header-search-results"
          />
        </label>
      </form>

      <AnimatePresence>
        {showPanel && (
          <m.div
            id="header-search-results"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-ink-100 bg-white p-1.5 shadow-(--shadow-lift)"
          >
            <SearchResults
              active={active}
              term={term}
              products={products}
              total={total}
              isLoading={isLoading}
              onNavigate={() => setOpen(false)}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
