import { env } from "./env";

/**
 * Brand metadata for Amoonis Boutique. The display name reflects what
 * customers see in the live site header and is used by `<Header>`/`<Footer>`
 * for the wordmark.
 */
export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME ?? "Amoonis Boutique",
  shortName: "Amoon",
  tagline: "Composed gift boxes for the moments that matter",
  description:
    "Amoonis Boutique — curated gift boxes, hand-tied flowers, and same-day delivery in the UAE. Composed by hand for graduations, Eid, newborns, and every quiet celebration in between.",
  url: "https://amoonis-boutique.com",
  ogImage: "/images/og-image.png",
  // Single store currency. The backend stores one price per product in one
  // currency (it has no per-region pricing and no public currency endpoint),
  // so the storefront displays this consistently regardless of delivery region.
  // Region selection controls catalog *visibility*, not currency.
  currency: "AED",
  locale: "en-AE",
  contact: {
    email: "hello@amoonis-boutique.com",
    phone: "+971 4 000 0000",
    whatsapp: "+971 50 000 0000",
    address: "Dubai, United Arab Emirates",
    hours: "Daily · 10:00 — 22:00",
  },
  links: {
    instagram: "https://instagram.com/amoonisboutique",
    tiktok: "https://tiktok.com/@amoonisboutique",
    whatsapp: "https://wa.me/971500000000",
  },
  shipping: {
    sameDayCutoff: "Order before 6 PM for same-day delivery in Dubai.",
    freeOver: 250,
    currency: "AED",
  },
  poweredBy: "MNASATI",
} as const;

export type SiteConfig = typeof siteConfig;
