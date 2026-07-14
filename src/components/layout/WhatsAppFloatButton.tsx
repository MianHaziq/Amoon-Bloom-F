"use client";

import { WhatsAppIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useT } from "@/i18n/useT";

/** Persistent chat affordance — mirrors the client site's floating WhatsApp button. */
export function WhatsAppFloatButton() {
  const { t } = useT();
  return (
    <a
      href={siteConfig.links.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label={t("common.chatOnWhatsapp")}
      className="group fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#25D366] animate-whatsapp-pulse"
      />
      <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 ring-1 ring-black/5 transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95">
        <WhatsAppIcon size={30} />
      </span>
    </a>
  );
}
