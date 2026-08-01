"use client";

import { CurrencyAmount } from "@/components/ui";
import { useT } from "@/i18n/useT";

/** One cash-arrangement line (per cart line that carries cash). Amount/fee are PER UNIT. */
export interface CashArrangementSummaryLine {
  key: string;
  title: string;
  quantity: number;
  cashAmount: number;
  denomination: number | null;
  note: string;
  eligible: boolean;
  feePerUnit: number;
  feeVatPerUnit: number;
}

/**
 * COMPACT read-only cash-arrangement summary, shown inside the "Your order" card at checkout.
 * Only the essentials — cash amount + arrangement service fee per line (denomination/note are
 * captured and submitted, just not shown here to keep the order summary tight). All numbers
 * are computed in CheckoutClient and passed down.
 */
export interface CashArrangementSummaryProps {
  lines: CashArrangementSummaryLine[];
  feeVatAdds: boolean;
  currency: string;
  locale: string;
}

export function CashArrangementSummary({ lines, feeVatAdds, currency, locale }: CashArrangementSummaryProps) {
  const { t } = useT();
  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {t("checkout.cashArrangementTitle")}
      </p>
      {lines.map((l) => (
        <div key={l.key} className="text-xs">
          {lines.length > 1 || l.quantity > 1 ? (
            <p className="truncate font-medium text-ink-700">
              {l.title}
              {l.quantity > 1 ? ` ×${l.quantity}` : ""}
            </p>
          ) : null}
          <div className="flex justify-between text-ink-500">
            <span>{t("checkout.cashAmountLineLabel")}</span>
            <CurrencyAmount amount={l.cashAmount} currency={currency} locale={locale} />
          </div>
          <div className="flex justify-between text-ink-500">
            <span>{t("checkout.cashArrangementFeeLabel")}</span>
            <span className="inline-flex items-baseline gap-1">
              <CurrencyAmount amount={l.feePerUnit} currency={currency} locale={locale} />
              {feeVatAdds && l.feeVatPerUnit > 0 ? (
                <span className="text-[10px] text-ink-400">
                  +<CurrencyAmount amount={l.feeVatPerUnit} currency={currency} locale={locale} />{" "}
                  {t("checkout.vatLabel")}
                </span>
              ) : null}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
