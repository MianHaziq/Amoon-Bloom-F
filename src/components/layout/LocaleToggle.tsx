"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocale, type Locale } from "@/store/slices/ui.slice";
import { readLocaleCookie, writeLocaleCookie } from "@/i18n";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

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
  const router = useRouter();
  const locale = useAppSelector((s) => s.ui.locale);
  const { t } = useT();

  const choose = (next: Locale) => {
    if (next === locale) return;
    dispatch(setLocale(next));
    writeLocaleCookie(next);
    // Re-render server components (catalog content + SSR copy) with the new
    // locale cookie so the whole page switches language immediately.
    router.refresh();
  };

  // Hydrate the store from the cookie on first mount so the client matches
  // whatever the server rendered (dir/lang).
  useEffect(() => {
    const fromCookie = readLocaleCookie();
    if (fromCookie && fromCookie !== locale) dispatch(setLocale(fromCookie));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    writeLocaleCookie(locale);
  }, [locale]);

  return (
    <div
      role="group"
      aria-label={t("common.language")}
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
            onClick={() => choose(opt.value)}
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
