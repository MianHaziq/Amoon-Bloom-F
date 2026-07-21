"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocale, type Locale } from "@/store/slices/ui.slice";
import { readLocaleCookie, writeLocaleCookie } from "@/i18n";
import { useT } from "@/i18n/useT";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui";
import { CheckIcon, ChevronDown, GlobeIcon } from "@/components/icons";

const LOCALES: { value: Locale; nativeLabel: string }[] = [
  { value: "en", nativeLabel: "English" },
  { value: "ar", nativeLabel: "العربية" },
];

export function LocaleToggle({
  className,
  variant = "pill",
}: {
  className?: string;
  /** "pill" is the labelled desktop trigger; "icon" is a compact globe-only
   *  button for the mobile header's icon row. */
  variant?: "pill" | "icon";
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useAppSelector((s) => s.ui.locale);
  const { t } = useT();

  const choose = (next: Locale) => {
    if (next === locale) return;
    dispatch(setLocale(next));
    writeLocaleCookie(next);
    router.refresh();
  };

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

  const currentLabel = locale === "ar" ? "العربية" : "English";

  const items = LOCALES.map((opt) => {
    const active = locale === opt.value;
    return (
      <MenuItem
        key={opt.value}
        onSelect={() => choose(opt.value)}
        trailing={
          active ? <CheckIcon size={14} className="text-bloom-600" /> : undefined
        }
        className={active ? "font-semibold text-ink-900" : undefined}
      >
        {opt.nativeLabel}
      </MenuItem>
    );
  });

  if (variant === "icon") {
    return (
      <Menu className={className}>
        <MenuTrigger
          label={t("common.language")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-all duration-200 hover:bg-bloom-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 aria-expanded:bg-bloom-600 aria-expanded:text-white"
        >
          <GlobeIcon size={20} />
        </MenuTrigger>

        <MenuContent align="end" className="min-w-36">
          {items}
        </MenuContent>
      </Menu>
    );
  }

  return (
    <Menu className={className} openOnHover>
      <MenuTrigger
        label={t("common.language")}
        className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-700 transition-all duration-200 hover:bg-ink-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 aria-expanded:bg-ink-900 aria-expanded:text-white"
      >
        <GlobeIcon size={18} className="shrink-0" />
        <span>{currentLabel}</span>
        <ChevronDown
          size={12}
          className="shrink-0 text-ink-400 transition-transform duration-200 group-aria-expanded:rotate-180"
        />
      </MenuTrigger>

      <MenuContent align="end" className="min-w-36">
        {items}
      </MenuContent>
    </Menu>
  );
}
