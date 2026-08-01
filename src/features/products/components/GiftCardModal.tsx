"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { SparkleIcon, CloseIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

/** One gift card in the order — `included` false means this unit gets no card. */
export interface GiftCardEntry {
  included: boolean;
  message: string;
}

interface GiftCardModalProps {
  open: boolean;
  /** How many units are being added — one card per unit. */
  quantity: number;
  /** Existing entries to restore when re-opening to edit. */
  initial: GiftCardEntry[];
  /** Cancel — discard changes. The caller reverts the toggle to "No" when no card
   *  was ever saved. */
  onCancel: () => void;
  /** Save the entries (one per unit). */
  onSave: (entries: GiftCardEntry[]) => void;
}

/**
 * Gift card message collector, opened from the inline "Include a gift card?" Yes
 * toggle. One card per quantity unit: a shopper buying three can write three
 * separate messages (or leave a card blank, or drop a card for a unit entirely).
 * Downstream, each distinct card becomes its own cart line (see lineVariantKey),
 * which is what makes "3 quantity = 3 separate cards" real.
 */
export function GiftCardModal({
  open,
  quantity,
  initial,
  onCancel,
  onSave,
}: GiftCardModalProps) {
  const { t } = useT();
  const total = Math.max(1, quantity);

  const seed = (): GiftCardEntry[] =>
    Array.from({ length: total }, (_, i) => ({
      included: initial[i]?.included ?? true,
      message: initial[i]?.message ?? "",
    }));

  const [entries, setEntries] = useState<GiftCardEntry[]>(seed);
  const [wasOpen, setWasOpen] = useState(open);

  // Re-seed each time the modal transitions to open (React's "adjust state when a
  // prop changes" pattern — no effect, no cascading renders).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setEntries(seed());
  }

  const patch = (i: number, p: Partial<GiftCardEntry>) =>
    setEntries((es) => es.map((e, idx) => (idx === i ? { ...e, ...p } : e)));

  const applyToAll = () => {
    const msg = entries[0]?.message ?? "";
    setEntries((es) => es.map((e) => (e.included ? { ...e, message: msg } : e)));
  };

  const multi = total > 1;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={multi ? t("product.giftCardModalTitleMulti") : t("product.giftCardModalTitle")}
      description={
        multi ? t("product.giftCardModalSubtitleMulti") : t("product.giftCardModalSubtitle")
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-blush-100 bg-gradient-to-br from-blush-50 to-cream-50"
            >
              <div className="flex items-center justify-between gap-3 px-4 pt-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-900">
                  <SparkleIcon size={14} className="text-bloom-500" />
                  {multi ? t("product.giftCardItemLabel", { n: i + 1 }) : t("product.giftCardBadge")}
                </span>
                {multi && entry.included && (
                  <button
                    type="button"
                    onClick={() => patch(i, { included: false, message: "" })}
                    className="inline-flex items-center gap-1 text-xs font-medium text-ink-400 transition-colors hover:text-ink-700"
                  >
                    <CloseIcon size={12} />
                    {t("product.giftCardRemove")}
                  </button>
                )}
              </div>

              {entry.included ? (
                <div className="px-4 pb-4 pt-2">
                  <textarea
                    value={entry.message}
                    onChange={(e) => patch(i, { message: e.target.value })}
                    rows={2}
                    maxLength={500}
                    placeholder={t("product.giftCardMessagePlaceholder")}
                    className="w-full resize-none rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => patch(i, { included: true })}
                  className="flex w-full items-center gap-2 px-4 pb-3 pt-1 text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800"
                >
                  <PlusIcon size={13} />
                  {t("product.giftCardAddOne")}
                </button>
              )}
            </div>
          ))}
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
            {t("product.giftCardApplyAll")}
          </button>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
          <Button variant="ghost" size="md" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button size="md" onClick={() => onSave(entries)}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
