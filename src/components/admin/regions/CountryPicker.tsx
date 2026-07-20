"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { RegionFlag } from "@/features/location/components/RegionFlag";
import { getCountryOptions, type CountryOption } from "@/features/regions/countries";

interface CountryPickerProps {
  onSelect: (country: CountryOption) => void;
}

/**
 * Search-to-select country picker for the "New region" flow. Picking a
 * country hands the caller its flag code, English + Arabic name, and a best-
 * guess currency in one shot — replacing four separate hand-typed fields
 * (and the typos that come with them, e.g. "Morocoo"/"MAE") with one search.
 * Every field it fills stays a normal, editable input afterward — this is a
 * starting point, not a lock.
 */
export function CountryPicker({ onSelect }: CountryPickerProps) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => getCountryOptions(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.includes(query.trim()) ||
        c.iso2.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-bloom-300 bg-bloom-50/60 px-4 py-3 text-start transition-colors hover:border-bloom-400 hover:bg-bloom-50",
          open && "border-bloom-500 ring-2 ring-bloom-500/20"
        )}
      >
        <span className="flex items-center gap-2.5">
          <SearchIcon size={16} className="text-bloom-600" />
          <span className="text-sm font-medium text-bloom-800">
            {t("admin.regionForm.countryPickerLabel")}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-bloom-500 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute inset-s-0 top-full z-30 mt-2 w-full min-w-72 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-(--shadow-lift) animate-fade-in-up">
          <div className="flex items-center gap-2 border-b border-ink-100 px-3.5 py-2.5">
            <SearchIcon size={15} className="shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.regionForm.countrySearchPlaceholder")}
              className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
          <div role="listbox" className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3.5 py-3 text-sm text-ink-400">
                {t("admin.regionForm.countryNoMatches")}
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-2 text-start text-sm text-ink-700 transition-colors hover:bg-bloom-50 hover:text-bloom-700"
                >
                  <RegionFlag region={{ iso2: c.iso2, name: c.nameEn }} shape="circle" className="h-6 w-6" />
                  <span className="min-w-0 flex-1 truncate">
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </span>
                  <span className="shrink-0 text-xs text-ink-400">{c.iso2}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
