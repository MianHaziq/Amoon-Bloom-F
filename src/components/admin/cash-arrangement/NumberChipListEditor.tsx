"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Small, page-scoped editor for a `number[]` field (quick-pick cash amounts, banknote
 * denomination presets) — used twice on CashArrangementSettingsPage. Not promoted to
 * `components/ui/` since it's a one-page concern, matching this codebase's habit of not
 * extracting shared components prematurely (the VAT/PromoCode specific-scope picker is
 * duplicated across files rather than shared, for the same reason).
 *
 * Managed via plain `watch`/`setValue` from the parent (like VatSettingsPage's own
 * `productIds`/`categoryIds` handling) rather than RHF `useFieldArray`, which expects
 * objects with stable keys — the wrong primitive for a bare number list.
 */
interface NumberChipListEditorProps {
  label: string;
  hint?: string;
  values: number[];
  onChange: (next: number[]) => void;
  placeholder?: string;
}

export function NumberChipListEditor({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: NumberChipListEditorProps) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return;
    if (!values.includes(n)) onChange([...values, n].sort((a, b) => a - b));
    setDraft("");
  };

  const removeValue = (n: number) => onChange(values.filter((v) => v !== n));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
        {label}
      </label>
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-full bg-bloom-50 px-3 py-1.5 text-sm font-medium text-bloom-800"
          >
            {v}
            <button
              type="button"
              onClick={() => removeValue(v)}
              className="text-bloom-500 hover:text-bloom-700"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          step={1}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          className={cn(
            "w-32 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm",
            "focus:border-bloom-500 focus:outline-none"
          )}
        />
        <button
          type="button"
          onClick={addValue}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-cream-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
