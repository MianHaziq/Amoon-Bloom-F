import { getCachedBanners } from "@/services/catalogCache";
import { getServerRegion } from "@/services/serverRegion";
import { siteConfig } from "@/config/site";
import { bannerMediaKind } from "@/features/banners/media";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

/**
 * Hero — full-bleed slideshow (mirrors the client's video hero).
 *
 * Source precedence:
 *   1. Admin-managed WEB banners (videos and/or images) — set in the admin panel.
 *      These are web-only; the mobile app keeps its own MOBILE image banners.
 *   2. siteConfig.heroVideos (hard-coded brand videos) if no web banners exist yet.
 *   3. A curated editorial image set, so the hero is never empty.
 */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    kind: "image",
    url: "https://ammon-pull-zone.b-cdn.net/uploads/d07649da-5c65-4a8d-819b-19aa75ee96cf.webp",
  },
  {
    id: "fallback-2",
    kind: "image",
    url: "https://ammon-pull-zone.b-cdn.net/uploads/1159b99d-6455-431e-8b92-4c5898ea85df.webp",
  },
  {
    id: "fallback-3",
    kind: "image",
    url: "https://ammon-pull-zone.b-cdn.net/uploads/e0e15105-612c-4c9f-9f42-c08cccb61299.webp",
  },
];

export async function Hero() {
  // 1. Admin-managed WEB banners (videos or images), in display order.
  const region = await getServerRegion();
  const webBanners = await getCachedBanners(region, "WEB").catch(() => []);
  const bannerSlides: HeroSlide[] = [...webBanners]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, url }) => ({ id, kind: bannerMediaKind(url), url }));

  // 2. Fall back to the hard-coded brand videos, then 3. the editorial images.
  const videoSlides: HeroSlide[] = (siteConfig.heroVideos ?? []).map(
    (url, i) => ({ id: `hero-video-${i}`, kind: "video", url })
  );

  const slides: HeroSlide[] =
    bannerSlides.length > 0
      ? bannerSlides
      : videoSlides.length > 0
        ? videoSlides
        : FALLBACK_SLIDES;

  return <HeroCarousel slides={slides} />;
}
