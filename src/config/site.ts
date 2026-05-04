import { env } from "./env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    "Amoonis Boutique — curated fashion, beauty, and lifestyle essentials.",
  url: "https://amoonis.com",
  ogImage: "/images/og-image.png",
  links: {
    instagram: "https://instagram.com/amoonis",
    twitter: "https://twitter.com/amoonis",
  },
} as const;

export type SiteConfig = typeof siteConfig;
