"use client";

import { useState } from "react";
import { Button, Modal, CurrencyAmount } from "@/components/ui";
import { PencilIcon, CloseIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

/** One unit's custom name — `included` false means this unit gets no name. */
export interface CustomNameEntry {
  included: boolean;
  name: string;
}

interface CustomNameModalProps {
  open: boolean;
  /** How many units are being added — one name per unit. */
  quantity: number;
  /** Existing entries to restore when re-opening to edit. */
  initial: CustomNameEntry[];
  /** Per-name price (added once per named unit). 0/undefined = free. */
  price?: number;
  currency: string;
  locale: string;
  /** Cancel — discard changes. The caller reverts the toggle to "No" when no name
   *  was ever saved. */
  onCancel: () => void;
  /** Save the entries (one per unit). */
  onSave: (entries: CustomNameEntry[]) => void;
}

/**
 * Per-unit custom-name collector — the name equivalent of GiftCardModal. A shopper
 * buying three can print a DIFFERENT name on each (e.g. "Ali", "Sara"), or leave a
 * unit with no name. Downstream, each distinct name becomes its own cart line (see
 * lineVariantKey's `__name` segment), so "3 quantity = 3 separate names" is real and
 * each named unit is priced independently.
 */
export function CustomNameModal({
  open,
  quantity,
  initial,
  price,
  currency,
  locale,
  onCancel,
  onSave,
}: CustomNameModalProps) {
  const { t } = useT();
  const total = Math.max(1, quantity);
  const unitPrice = price ?? 0;

  const seed = (): CustomNameEntry[] =>
    Array.from({ length: total }, (_, i) => ({
      included: initial[i]?.included ?? true,
      name: initial[i]?.name ?? "",
    }));

  const [entries, setEntries] = useState<CustomNameEntry[]>(seed);
  const [showErrors, setShowErrors] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Re-seed each time the modal transitions to open (React's "adjust state when a
  // prop changes" pattern — no effect, no cascading renders).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEntries(seed());
      setShowErrors(false);
    }
  }

  const patch = (i: number, p: Partial<CustomNameEntry>) =>
    setEntries((es) => es.map((e, idx) => (idx === i ? { ...e, ...p } : e)));

  const applyToAll = () => {
    const name = entries[0]?.name ?? "";
    setEntries((es) => es.map((e) => (e.included ? { ...e, name } : e)));
  };

  const handleSave = () => {
    // A named unit must actually carry a name (it's printed and charged). Empty
    // included entries block the save and surface an inline error.
    if (entries.some((e) => e.included && !e.name.trim())) {
      setShowErrors(true);
      return;
    }
    onSave(entries);
  };

  const multi = total > 1;
  const namedCount = entries.filter((e) => e.included && e.name.trim()).length;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={multi ? t("product.customNameModalTitleMulti") : t("product.customNameModalTitle")}
      description={
        multi ? t("product.customNameModalSubtitleMulti") : t("product.customNameModalSubtitle")
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {entries.map((entry, i) => {
            const invalid = showErrors && entry.included && !entry.name.trim();
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-blush-100 bg-gradient-to-br from-blush-50 to-cream-50"
              >
                <div className="flex items-center justify-between gap-3 px-4 pt-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-900">
                    <PencilIcon size={13} className="text-bloom-500" />
                    {multi ? t("product.customNameUnitLabel", { n: i + 1 }) : t("admin.orderDetailPage.customNameLabel")}
                  </span>
                  {multi && entry.included && (
                    <button
                      type="button"
                      onClick={() => patch(i, { included: false, name: "" })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-400 transition-colors hover:text-ink-700"
                    >
                      <CloseIcon size={12} />
                      {t("product.customNameRemove")}
                    </button>
                  )}
                </div>

                {entry.included ? (
                  <div className="px-4 pb-4 pt-2">
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => patch(i, { name: e.target.value })}
                      maxLength={120}
                      placeholder={t("product.customNamePlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4",
                        invalid
                          ? "border-danger focus:ring-danger/10"
                          : "border-ink-200 focus:border-bloom-400 focus:ring-bloom-100"
                      )}
                    />
                    {invalid && (
                      <p className="mt-1 text-xs text-danger">{t("product.customNameRequired")}</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => patch(i, { included: true })}
                    className="flex w-full items-center gap-2 px-4 pb-3 pt-1 text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800"
                  >
                    <PlusIcon size={13} />
                    {t("product.customNameAddOne")}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {multi && (
          <button
            type="button"
            onClick={applyToAll}
            className={cn(
              "self-start text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800 hover:underline",
              !entries[0]?.included && "pointer-events-none opacity-40"
            )}
          >
            {t("product.customNameApplyAll")}
          </button>
        )}

        {unitPrice > 0 && namedCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-ink-100 bg-white/70 px-3 py-2 text-xs text-ink-600">
            <span>
              {namedCount === 1
                ? t("product.customNameFeeOne")
                : t("product.customNameFeeMany", { count: namedCount })}
            </span>
            <span className="font-semibold text-ink-800">
              <CurrencyAmount amount={namedCount * unitPrice} currency={currency} locale={locale} />
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
          <Button variant="ghost" size="md" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button size="md" onClick={handleSave}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
