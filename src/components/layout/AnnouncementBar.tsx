"use client";

import { useQuery } from "@tanstack/react-query";
import { TruckIcon, SparkleIcon, PinIcon, TagIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { useRegionCopy } from "@/features/location/hooks/useRegionCopy";
import { useCurrency } from "@/features/location/hooks/useCurrency";
import { deliveryConfigApi } from "@/features/delivery-config/api/delivery-config.api";
import { queryKeys } from "@/services/queryKeys";
import { formatCurrency, formatCutoffTime } from "@/lib/format";

export function AnnouncementBar() {
  const { t, dir } = useT();
  const regionCopy = useRegionCopy();
  const { currency, locale, countryCode } = useCurrency();

  // Region-level delivery config (no zone/subtotal — this is the global top bar). Drives
  // the same-day + free-delivery messages from real admin config instead of hardcoded copy.
  const { data: config } = useQuery({
    queryKey: queryKeys.deliveryConfig.resolve(countryCode),
    queryFn: () => deliveryConfigApi.get({ region: countryCode }),
    enabled: Boolean(countryCode),
    staleTime: 5 * 60_000,
  });

  const items: { icon: typeof TruckIcon; label: string }[] = [];

  // Free delivery — only when a threshold is configured for this region.
  if (config?.freeDeliveryThreshold != null) {
    items.push({
      icon: TagIcon,
      label: t("announcement.freeDelivery", {
        amount: formatCurrency(config.freeDeliveryThreshold, currency, locale),
      }),
    });
  }

  // Same-day — only when the region offers it; use the real cutoff when set.
  if (config?.sameDayEnabled) {
    items.push({
      icon: TruckIcon,
      label: config.sameDayCutoff
        ? t("announcement.sameDayCutoff", {
            city: regionCopy.city,
            cutoff: formatCutoffTime(config.sameDayCutoff, locale),
          })
        : t("announcement.sameDay", { city: regionCopy.city }),
    });
  }

  // Static brand/marketing items (always shown, so the bar is never empty while config loads).
  items.push({ icon: SparkleIcon, label: t("announcement.handPacked", { city: regionCopy.city }) });
  items.push({
    icon: PinIcon,
    label:
      regionCopy.countryCode === "UAE"
        ? t("announcement.branches", { country: regionCopy.country })
        : t("announcement.deliveryOnly", { country: regionCopy.country }),
  });

  return (
    <div className="group relative h-9 overflow-hidden bg-black text-cream-100">
      {/* Glossy sheen sweeping across the bar every few seconds */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-linear-to-r from-transparent via-white/10 to-transparent animate-sheen-sweep"
      />

      {/* Continuous scrolling ticker — content is duplicated so the loop is seamless */}
      <div className="flex h-full items-center">
        {/* key={dir}: remount the scrolling row when the language flips so the
            CSS marquee restarts in the new direction (its direction is fixed at
            mount under <html dir>, which a live switch alone doesn't re-establish). */}
        <div
          key={dir}
          className="flex shrink-0 animate-marquee items-center whitespace-nowrap [animation-duration:26s] group-hover:[animation-play-state:paused]"
        >
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0 items-center" aria-hidden={rep === 1 || undefined}>
              {items.map(({ icon: Icon, label }) => (
                <span key={`${rep}-${label}`} className="inline-flex shrink-0 items-center gap-2 px-6 text-xs">
                  <Icon size={14} className="text-bloom-300" />
                  <span className="tracking-wide text-cream-100/85">{label}</span>
                  <span aria-hidden className="ms-4 text-bloom-400/40">
                    &#10022;
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Edge fades so the ticker never hard-clips against the bar's edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-linear-to-r from-black to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-linear-to-l from-black to-transparent"
      />
    </div>
  );
}
