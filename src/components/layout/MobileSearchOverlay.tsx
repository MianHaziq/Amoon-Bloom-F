"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { SearchIcon } from "@/components/icons";
import { EASE_OUT } from "@/lib/motion";
import { ROUTES } from "@/constants/routes";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useProductQuickSearch } from "@/features/products/hooks/useProductQuickSearch";
import { useT } from "@/i18n/useT";
import { SearchResults } from "./SearchResults";

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile search. The header's search icon has no room for an inline
 * input, so tapping it opens this overlay: an autofocused input pinned to the
 * top (raising the keyboard immediately) with live type-ahead results below.
 * Replaces the old behaviour where the icon just dumped the user on an empty
 * /shop page with no way to type a query.
 */
export function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  const mounted = useIsHydrated();
  const router = useRouter();
  const { t } = useT();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { active, term, products, total, isLoading } =
    useProductQuickSearch(query);

  // Clear the term whenever the overlay closes, so the next open starts fresh
  // (done here, not in an open-effect, to avoid a setState-in-effect cascade).
  const handleClose = () => {
    setQuery("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    // Focus after mount so the mobile keyboard raises without a manual tap.
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // handleClose is stable enough for this lifecycle-scoped effect; only `open`
    // should re-run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `${ROUTES.shop}?q=${encodeURIComponent(q)}` : ROUTES.shop);
    handleClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          className="fixed inset-0 z-100 flex flex-col bg-cream-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("common.search")}
        >
          <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-3">
            <form role="search" onSubmit={submitSearch} className="min-w-0 flex-1">
              <label className="flex h-11 items-center gap-3 rounded-full border border-ink-200 bg-white px-4 focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100">
                <SearchIcon size={18} className="text-ink-400" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("nav.searchPlaceholder")}
                  className="h-full flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
                  aria-label={t("common.search")}
                  enterKeyHint="search"
                />
              </label>
            </form>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-ink-700 transition-colors active:bg-ink-50"
            >
              {t("common.cancel")}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
            <SearchResults
              active={active}
              term={term}
              products={products}
              total={total}
              isLoading={isLoading}
              onNavigate={handleClose}
              size="md"
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
