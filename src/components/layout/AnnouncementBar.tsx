"use client";

import { TruckIcon, SparkleIcon, PinIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { useRegionCopy } from "@/features/location/hooks/useRegionCopy";

export function AnnouncementBar() {
  const { t } = useT();
  const regionCopy = useRegionCopy();
  const items = [
    { icon: TruckIcon, label: t("announcement.sameDay", { city: regionCopy.city }) },
    { icon: SparkleIcon, label: t("announcement.handPacked", { city: regionCopy.city }) },
    {
      icon: PinIcon,
      label:
        regionCopy.countryCode === "UAE"
          ? t("announcement.branches", { country: regionCopy.country })
          : t("announcement.deliveryOnly", { country: regionCopy.country }),
    },
  ];

  return (
    <div className="group relative h-9 overflow-hidden bg-black text-cream-100">
      {/* Glossy sheen sweeping across the bar every few seconds */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-linear-to-r from-transparent via-white/10 to-transparent animate-sheen-sweep"
      />

      {/* Continuous scrolling ticker — content is duplicated so the loop is seamless */}
      <div className="flex h-full items-center">
        <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap [animation-duration:26s] group-hover:[animation-play-state:paused]">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0 items-center" aria-hidden={rep === 1 || undefined}>
              {items.map(({ icon: Icon, label }, i) => (
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
