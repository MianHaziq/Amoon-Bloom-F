"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/store";
import { t, tCount, type MessageKey } from "./messages";
import { dirFor } from "./index";

/**
 * Client-side translation hook. Reads the active locale from the redux ui
 * slice (kept in sync with the cookie by LocaleToggle) and returns a bound
 * `t()`, a count-aware `tc()`, the current locale, and the text direction.
 */
export function useT() {
  const locale = useAppSelector((s) => s.ui.locale);
  const translate = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      t(locale, key, vars),
    [locale]
  );
  const translateCount = useCallback(
    (n: number, oneKey: MessageKey, otherKey: MessageKey) =>
      tCount(locale, n, oneKey, otherKey),
    [locale]
  );
  return { t: translate, tc: translateCount, locale, dir: dirFor(locale) };
}
