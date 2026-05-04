"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocale, type Locale } from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ar", label: "AR" },
];

/**
 * Locale toggle. Stores the choice in redux and reflects `dir` + `lang` on
 * the document root so future RTL strings flow naturally. We keep the toggle
 * lightweight here — actual translations land via a separate i18n layer.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.ui.locale);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full bg-cream-100 p-0.5 text-xs font-semibold",
        className
      )}
    >
      {LOCALES.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => dispatch(setLocale(opt.value))}
            aria-pressed={active}
            className={cn(
              "rounded-full px-3 py-1.5 transition-all duration-200",
              active
                ? "bg-white text-ink-900 shadow-(--shadow-soft)"
                : "text-ink-500 hover:text-ink-900"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
