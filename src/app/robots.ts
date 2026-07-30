import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE = siteConfig.url.replace(/\/$/, "");

/**
 * Allow crawling of the public storefront, but keep private and non-content
 * areas out of the index. `/admin` and every region/locale `account` area are
 * user-specific (and gated), so they're disallowed; `/api` is not content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/*/*/account", "/*/*/checkout", "/*/*/order/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
