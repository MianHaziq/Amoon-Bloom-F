import { useT } from "@/i18n/useT";
import { ChatIcon, SparkleIcon, PencilIcon, CashIcon } from "@/components/icons";
import { CurrencyAmount } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Per-item add-ons on an order line — gift card, custom name, and gift message —
 * rendered as one small, consistent block: the first two as labelled pills, the
 * gift message as a soft quote card (so a free-text note reads as an intentional
 * detail, not a stray italic string). Shared by the admin order detail, the
 * account order detail, and the checkout receipt so all three look identical.
 * Renders nothing when the line has no extras.
 */
export function OrderItemExtras({
  giftCardSelected,
  customName,
  message,
  cashArrangement,
  currency,
  locale,
  className,
}: {
  giftCardSelected?: boolean;
  customName?: string | null;
  message?: string | null;
  /** Per-unit cash arrangement for this line — shown as a pill (needs currency + locale). */
  cashArrangement?: { cashAmount: number; denomination?: number | null } | null;
  currency?: string;
  locale?: string;
  className?: string;
}) {
  const { t } = useT();
  const name = customName?.trim();
  const note = message?.trim();
  const cashAmount = cashArrangement?.cashAmount;
  const hasCash = Boolean(cashAmount && cashAmount > 0 && currency && locale);
  const hasPill = giftCardSelected || Boolean(name) || hasCash;
  if (!hasPill && !note) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hasPill ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {giftCardSelected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bloom-50 px-2.5 py-1 text-[11px] font-semibold text-bloom-700 ring-1 ring-inset ring-bloom-100">
              <SparkleIcon size={12} />
              {t("admin.orderDetailPage.giftCardLabel")}
            </span>
          ) : null}
          {hasCash ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <CashIcon size={12} />
              {t("admin.orderDetailPage.cashLabel")}:{" "}
              <CurrencyAmount amount={cashAmount!} currency={currency!} locale={locale!} />
            </span>
          ) : null}
          {name ? (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-700 ring-1 ring-inset ring-ink-100">
              <PencilIcon size={11} className="shrink-0 text-ink-400" />
              <span className="shrink-0 text-ink-400">
                {t("admin.orderDetailPage.customNameLabel")}:
              </span>
              <span className="truncate font-semibold text-ink-800">{name}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {note ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-cream-50/70 px-3 py-2">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-bloom-600 ring-1 ring-ink-100">
            <ChatIcon size={13} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              {t("admin.orderDetailPage.giftMessageLabel")}
            </p>
            <p className="wrap-break-word text-sm italic leading-snug text-ink-700">
              &ldquo;{note}&rdquo;
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
