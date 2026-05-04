import { env } from "./env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME ?? "Amoon Bloom",
  tagline: "Bloom in every moment",
  description:
    "Hand-arranged flowers, considered gifts, and same-day delivery for the moments that matter — designed in the boutique, delivered with care.",
  url: "https://amoonbloom.com",
  ogImage: "/images/og-image.png",
  contact: {
    email: "hello@amoonbloom.com",
    phone: "+971 4 000 0000",
    whatsapp: "+971 50 000 0000",
    address: "Boulevard 1, Downtown Dubai, UAE",
    hours: "Daily · 8:00 — 22:00",
  },
  links: {
    instagram: "https://instagram.com/amoonbloom",
    tiktok: "https://tiktok.com/@amoonbloom",
    pinterest: "https://pinterest.com/amoonbloom",
  },
  shipping: {
    sameDayCutoff: "Order before 6 PM for same-day delivery in Dubai.",
    freeOver: 250,
    currency: "AED",
  },
} as const;

export type SiteConfig = typeof siteConfig;
