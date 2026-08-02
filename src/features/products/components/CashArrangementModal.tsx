"use client";

import { useState } from "react";
import { Button, Modal, CurrencyAmount } from "@/components/ui";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import { computeCashArrangementFee } from "@/features/cash-arrangement/cashArrangementFee";
import type { ApiCashArrangementResolveResult } from "@/features/cash-arrangement/types";

/** One unit's cash arrangement. `included` false means this unit gets no cash. */
export interface CashUnitEntry {
  included: boolean;
  /** Raw text so quick-pick taps and free typing share one field. */
  cashAmount: string;
  denomination: number | null;
  note: string;
}

interface CashArrangementModalProps {
  open: boolean;
  /** How many units are being added — one cash arrangement per unit. */
  quantity: number;
  /** Resolved eligibility/config for this product (quick-picks, denominations, fee schedule). */
  config: ApiCashArrangementResolveResult;
  initial: CashUnitEntry[];
  currency: string;
  locale: string;
  onCancel: () => void;
  onSave: (entries: CashUnitEntry[]) => void;
}

/**
 * Per-unit cash-arrangement collector — the cash equivalent of GiftCardModal. A shopper
 * buying three can attach a DIFFERENT cash amount to each (or leave a unit with none).
 * Downstream, each distinct cash config becomes its own cart line (see lineVariantKey), which
 * is what makes "3 quantity = 3 different cash gifts" real.
 */
export function CashArrangementModal({
  open,
  quantity,
  config,
  initial,
  currency,
  locale,
  onCancel,
  onSave,
}: CashArrangementModalProps) {
  const { t } = useT();
  const total = Math.max(1, quantity);

  const seed = (): CashUnitEntry[] =>
    Array.from({ length: total }, (_, i) => ({
      included: initial[i]?.included ?? true,
      cashAmount: initial[i]?.cashAmount ?? "",
      denomination: initial[i]?.denomination ?? null,
      note: initial[i]?.note ?? "",
    }));

  const [entries, setEntries] = useState<CashUnitEntry[]>(seed);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setEntries(seed());
  }

  const patch = (i: number, p: Partial<CashUnitEntry>) =>
    setEntries((es) => es.map((e, idx) => (idx === i ? { ...e, ...p } : e)));

  const applyToAll = () => {
    const first = entries[0];
    if (!first) return;
    setEntries((es) =>
      es.map((e) =>
        e.included ? { ...e, cashAmount: first.cashAmount, denomination: first.denomination, note: first.note } : e
      )
    );
  };

  const feeFor = (raw: string): number => {
    const amt = Number(raw);
    if (!(amt > 0) || config.feeStepAmount == null || config.feeMarginPercent == null) return 0;
    return computeCashArrangementFee(amt, {
      feeStepAmount: config.feeStepAmount,
      feeMarginPercent: config.feeMarginPercent,
    });
  };

  const multi = total > 1;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={t("product.cashModalTitle")}
      description={multi ? t("product.cashModalSubtitleMulti") : t("product.cashModalSubtitle")}
    >
      <div className="flex flex-col gap-4">
        {/* No nested scroll — the Modal body scrolls; the footer below is pinned so Save is
            always reachable no matter how many items/rows there are. */}
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => {
            const amt = Number(entry.cashAmount);
            const valid = amt > 0;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-blush-100 bg-gradient-to-br from-blush-50 to-cream-50"
              >
                <div className="flex items-center justify-between gap-3 px-4 pt-3">
                  <span className="text-sm font-medium text-ink-900">
                    {multi ? t("product.cashUnitLabel", { n: i + 1 }) : t("checkout.cashArrangementTitle")}
                  </span>
                  {multi && entry.included && (
                    <button
                      type="button"
                      onClick={() => patch(i, { included: false, cashAmount: "", denomination: null, note: "" })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-400 transition-colors hover:text-ink-700"
                    >
                      <CloseIcon size={12} />
                      {t("product.cashRemoveUnit")}
                    </button>
                  )}
                </div>

                {entry.included ? (
                  <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
                    {config.quickPickAmounts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {config.quickPickAmounts.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => patch(i, { cashAmount: String(q) })}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                              amt === q
                                ? "border-bloom-600 bg-bloom-50 text-bloom-700"
                                : "border-ink-200 text-ink-700 hover:border-bloom-300"
                            )}
                          >
                            <CurrencyAmount amount={q} currency={currency} locale={locale} />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div>
                      <label className="mb-1 block text-xs text-ink-500">
                        {t("checkout.cashAmountOrCustom")}
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder={t("checkout.cashAmountCustomPlaceholder")}
                        value={entry.cashAmount}
                        onChange={(e) => patch(i, { cashAmount: e.target.value })}
                        className="w-full rounded-xl border border-ink-200 bg-white/80 px-3 py-2 text-sm focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                      />
                    </div>

                    {valid && config.denominations.length > 0 ? (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                          {t("checkout.cashDenominationLabel")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {config.denominations.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => patch(i, { denomination: entry.denomination === d ? null : d })}
                              className={cn(
                                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                                entry.denomination === d
                                  ? "border-bloom-600 bg-bloom-50 text-bloom-700"
                                  : "border-ink-200 text-ink-700 hover:border-bloom-300"
                              )}
                            >
                              <CurrencyAmount amount={d} currency={currency} locale={locale} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <textarea
                      value={entry.note}
                      onChange={(e) => patch(i, { note: e.target.value })}
                      rows={2}
                      maxLength={500}
                      placeholder={t("checkout.cashNotePlaceholder")}
                      className="w-full resize-none rounded-xl border border-ink-200 bg-white/80 px-3 py-2 text-sm placeholder:text-ink-400 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100"
                    />

                    {valid ? (
                      <div className="flex justify-between rounded-lg border border-ink-100 bg-white/70 px-3 py-2 text-xs text-ink-600">
                        <span>{t("checkout.cashArrangementFeeLabel")}</span>
                        <CurrencyAmount amount={feeFor(entry.cashAmount)} currency={currency} locale={locale} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => patch(i, { included: true })}
                    className="flex w-full items-center gap-2 px-4 pb-3 pt-1 text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800"
                  >
                    <PlusIcon size={13} />
                    {t("product.cashAddUnit")}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Pinned footer — sticks to the bottom of the (scrolling) Modal body. The negative
            margins pull it flush to the Modal body's px-6/py-5 padding so it spans full width.
            "Use this cash for all items" lives IN this bar (not as a floating line above it) —
            with 2+ items the body overflows and this footer stays pinned over whatever's last
            in the scrollable content, so anything placed just above it here would be
            permanently hidden underneath it rather than merely scrolled past. */}
        <div className="sticky bottom-0 z-10 -mx-6 -mb-5 flex items-center gap-3 border-t border-ink-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          {multi && (
            <button
              type="button"
              onClick={applyToAll}
              className={cn(
                "text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800 hover:underline",
                !entries[0]?.included && "pointer-events-none opacity-40"
              )}
            >
              {t("product.cashApplyAll")}
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="md" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button size="md" onClick={() => onSave(entries)}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
