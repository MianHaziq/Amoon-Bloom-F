import { TruckIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { formatDayCount, formatCutoffTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Delivery note on the product detail page (AddToCartPanel).
 *
 * - `days` is the resolved standard prep/booking lead time (product → category →
 *   zone/region standard → site default; see ApiProduct.resolvedDeliveryLeadDays).
 * - `sameDayCutoff` ("HH:mm") is set only when same-day delivery is enabled for the
 *   current region/zone. When present, the note leads with the same-day offer and
 *   keeps the standard lead as secondary context ("otherwise ships within N days").
 *   Gated on the feature being enabled (not the live before-cutoff flag), so it stays
 *   accurate under caching; the checkout date picker enforces the actual cutoff.
 */
export function ShippingLeadNote({
  days,
  sameDayCutoff,
  className,
}: {
  days: number;
  sameDayCutoff?: string | null;
  className?: string;
}) {
  const { t, locale } = useT();

  const standardLine =
    days === 0
      ? t("product.shippingNoteZero")
      : t("product.shippingNote", { days: formatDayCount(days, locale) });

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white",
        className
      )}
    >
      <TruckIcon size={18} className="mt-0.5 shrink-0 text-white" />
      {sameDayCutoff ? (
        <span className="flex flex-col gap-0.5">
          <span>
            {t("product.sameDayNote", {
              cutoff: formatCutoffTime(sameDayCutoff, locale),
            })}
          </span>
          {days > 0 && (
            <span className="text-xs font-normal text-white/70">
              {t("product.sameDayOtherwise", { days: formatDayCount(days, locale) })}
            </span>
          )}
        </span>
      ) : (
        <span>{standardLine}</span>
      )}
    </div>
  );
}
