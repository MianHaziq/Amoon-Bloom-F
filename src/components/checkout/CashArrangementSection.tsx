"use client";

import { CurrencyAmount, Textarea } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";

/**
 * "Add cash arrangement" — optional checkout add-on. Extracted to its own file (rather
 * than inlined like the ~50-line Coupon toggle above it in CheckoutClient.tsx) because of
 * its real size: accordion trigger, quick-pick chip row, custom-amount input, an optional
 * denomination chip row, a note textarea, and a live fee breakdown. The *interaction
 * model* still follows the Coupon toggle's own precedent — hand-rolled open/closed state
 * (owned by the parent, since it must feed the final total) + a ChevronDown icon — since no
 * generic Accordion component exists in this codebase.
 *
 * All numbers (feeAmount, feeVatAmount) are computed ONCE in CheckoutClient.tsx and passed
 * down as props — this component is a pure presentational consumer, it never recomputes them.
 */
export interface CashArrangementSectionProps {
  open: boolean;
  onToggleOpen: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  quickPickAmounts: number[];
  denominations: number[];
  amountRaw: string;
  onAmountRawChange: (v: string) => void;
  denomination: number | null;
  onDenominationChange: (v: number | null) => void;
  note: string;
  onNoteChange: (v: string) => void;
  feeAmount: number;
  feeVatAmount: number;
  feeVatAdds: boolean;
  cashAmountValid: boolean;
  /** Product unit price — shown as the "Product price" line + folded into the
   *  "Estimated subtotal before VAT" total. Omit to hide those two lines. */
  productPrice?: number;
  currency: string;
  locale: string;
}

export function CashArrangementSection({
  open,
  onToggleOpen,
  isLoading,
  isRefetching,
  quickPickAmounts,
  denominations,
  amountRaw,
  onAmountRawChange,
  denomination,
  onDenominationChange,
  note,
  onNoteChange,
  feeAmount,
  feeVatAmount,
  feeVatAdds,
  cashAmountValid,
  productPrice,
  currency,
  locale,
}: CashArrangementSectionProps) {
  const { t } = useT();

  // Never render purely because the resolve query hasn't loaded yet — mirrors this
  // file's own convention for every other gate (deliveryConfig, codUnavailable, ...).
  if (isLoading) return null;

  const activeAmount = amountRaw.trim() === "" ? null : Number(amountRaw);

  return (
    <div className="rounded-2xl border border-ink-100 bg-cream-50 p-4">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between gap-3 text-start"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-ink-900">
            {t("checkout.cashArrangementTitle")}
          </span>
          <span className="block text-xs text-ink-500">
            {t("checkout.cashArrangementSubtitle")}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-ink-500 transition-transform duration-200 rtl:-scale-x-100",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-4 flex flex-col gap-4">
          {isRefetching ? (
            <p className="text-xs text-ink-400">{t("common.updating")}</p>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t("checkout.cashAmountLabel")}
            </p>
            {quickPickAmounts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {quickPickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onAmountRawChange(String(amt))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      activeAmount === amt
                        ? "border-bloom-600 bg-bloom-50 text-bloom-700"
                        : "border-ink-200 text-ink-700 hover:border-bloom-300"
                    )}
                  >
                    <CurrencyAmount amount={amt} currency={currency} locale={locale} />
                  </button>
                ))}
              </div>
            ) : null}
            {/* Always-visible label so it's clear you can type any amount, even after a
                quick-pick chip has filled the field (the placeholder then hides). */}
            <label className="mb-1 mt-3 block text-xs text-ink-500">
              {t("checkout.cashAmountOrCustom")}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder={t("checkout.cashAmountCustomPlaceholder")}
              value={amountRaw}
              onChange={(e) => onAmountRawChange(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-bloom-500 focus:outline-none"
            />
          </div>

          {/* Denomination is purely informational (courier prep) — a preset-only pick,
              never affecting the fee preview, so it's independent of the amount above. */}
          {cashAmountValid && denominations.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {t("checkout.cashDenominationLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {denominations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDenominationChange(denomination === d ? null : d)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      denomination === d
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

          <Textarea
            label={t("checkout.cashNoteLabel")}
            placeholder={t("checkout.cashNotePlaceholder")}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={2}
          />

          {cashAmountValid ? (
            <div className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-white p-3 text-sm">
              {productPrice != null ? (
                <div className="flex justify-between text-ink-600">
                  <span>{t("checkout.productPriceLabel")}</span>
                  <span>
                    <CurrencyAmount amount={productPrice} currency={currency} locale={locale} />
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-600">
                <span>{t("checkout.cashAmountLineLabel")}</span>
                <span>
                  <CurrencyAmount amount={activeAmount!} currency={currency} locale={locale} />
                </span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>{t("checkout.cashArrangementFeeLabel")}</span>
                <span className="inline-flex items-baseline gap-1">
                  <CurrencyAmount amount={feeAmount} currency={currency} locale={locale} />
                  {feeVatAdds ? (
                    <span className="text-xs text-ink-400">
                      +<CurrencyAmount amount={feeVatAmount} currency={currency} locale={locale} />{" "}
                      {t("checkout.vatLabel")}
                    </span>
                  ) : null}
                </span>
              </div>
              {productPrice != null ? (
                <div className="flex justify-between border-t border-ink-100 pt-2 font-semibold text-ink-900">
                  <span>{t("checkout.cashSubtotalBeforeVatLabel")}</span>
                  <span>
                    <CurrencyAmount
                      amount={productPrice + activeAmount! + feeAmount}
                      currency={currency}
                      locale={locale}
                    />
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
