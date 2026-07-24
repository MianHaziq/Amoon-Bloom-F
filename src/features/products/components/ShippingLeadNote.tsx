import { TruckIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { formatDayCount } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * "This product will be shipped within N day(s)" note — the resolved
 * product -> category -> site-default prep/booking lead time (see
 * ApiProduct.resolvedDeliveryLeadDays). PER-PRODUCT, shown only on the product
 * detail page (AddToCartPanel). Cart/checkout surfaces show a single order-level
 * badge instead — see OrderDeliveryNote.
 */
export function ShippingLeadNote({
  days,
  className,
}: {
  days: number;
  className?: string;
}) {
  const { t, locale } = useT();
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white",
        className
      )}
    >
      <TruckIcon size={18} className="shrink-0 text-white" />
      <span>
        {days === 0
          ? t("product.shippingNoteZero")
          : t("product.shippingNote", { days: formatDayCount(days, locale) })}
      </span>
    </div>
  );
}
