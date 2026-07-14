import { DirhamSign, RiyalSign } from "@/components/icons";
import { formatAmount } from "@/lib/format";

const CURRENCY_ICONS: Record<string, typeof DirhamSign> = {
  AED: DirhamSign,
  SAR: RiyalSign,
};

interface CurrencyAmountProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
}

/**
 * Visual price display: the official AED/SAR currency sign (see
 * src/components/icons/index.tsx) followed by the formatted number — for any
 * currency without a traced sign, falls back to the plain ISO code as text.
 * Use this for JSX/visual price displays; use formatCurrency() from
 * @/lib/format for text-only contexts (toasts, i18n vars, title attributes).
 */
export function CurrencyAmount({
  amount,
  currency = "AED",
  locale = "en-AE",
  className,
}: CurrencyAmountProps) {
  const Icon = CURRENCY_ICONS[currency];
  return (
    <span className={className}>
      {Icon ? <Icon style={{ marginInlineEnd: "0.2em" }} /> : `${currency} `}
      {formatAmount(amount, locale)}
    </span>
  );
}
