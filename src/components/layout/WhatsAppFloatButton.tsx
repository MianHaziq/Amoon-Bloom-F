"use client";

import { WhatsAppIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { useRegionContact } from "@/features/location/hooks/useRegionContact";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/cn";

/** Persistent chat affordance — mirrors the client site's floating WhatsApp button. */
export function WhatsAppFloatButton() {
  const { t } = useT();
  const { whatsappUrl } = useRegionContact();
  // PDPs render a mobile-only sticky add-to-cart bar in this same bottom-end
  // corner; lift clear of it instead of stacking on top (see StickyAddToCart).
  const stickyBarMounted = useAppSelector((s) => s.ui.isStickyAddToCartMounted);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={t("common.chatOnWhatsapp")}
      className={cn(
        "group fixed end-5 z-40 inline-flex h-14 w-14 items-center justify-center transition-[bottom] duration-300 ease-out-soft",
        stickyBarMounted ? "bottom-24 lg:bottom-5" : "bottom-5"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] animate-whatsapp-pulse"
      />
      <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 ring-1 ring-black/5 transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95">
        <WhatsAppIcon size={30} />
      </span>
    </a>
  );
}
