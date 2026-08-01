"use client";

import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

/**
 * Yes/No pill pair — the same visual language as OptionPicker's pills. Shared by
 * the add-to-cart panel and the per-unit personalization wizard so both read as
 * one control.
 */
export function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useT();
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-all",
      active
        ? "border-ink-900 bg-ink-900 text-white"
        : "border-ink-200 bg-white text-ink-900 hover:border-ink-400"
    );
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!value}
        className={pill(!value)}
      >
        {t("product.optionNo")}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={value}
        className={pill(value)}
      >
        {t("product.optionYes")}
      </button>
    </div>
  );
}
