import { getCachedBanners } from "@/services/catalogCache";
import { getServerRegion } from "@/services/serverRegion";
import { siteConfig } from "@/config/site";
import { bannerMediaKind } from "@/features/banners/media";
import { Container } from "@/components/ui";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

/**
 * Hero — inset 16:9 slideshow, padded to align with the product grid container.
 *
 * Composition:
 *   1. The hard-coded brand videos (siteConfig.heroVideos) are the base of the hero.
 *   2. Admin-managed WEB banners (images and/or videos, in their admin order) are
 *      APPENDED AFTER the brand videos — so adding a banner ADDS to the hero instead
 *      of replacing the videos. These are web-only; the mobile app keeps its own
 *      MOBILE image banners.
 *   3. If there are neither, a curated editorial image set keeps the hero non-empty.
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

  // The brand videos are the base; admin banners are appended after them (not a
  // replacement), so adding one image gives "3 videos + that image", image last.
  const videoSlides: HeroSlide[] = (siteConfig.heroVideos ?? []).map(
    (url, i) => ({ id: `hero-video-${i}`, kind: "video", url })
  );

  const combined: HeroSlide[] = [...videoSlides, ...bannerSlides];
  // Only fall back to the editorial image set when there are truly no slides at all.
  const slides: HeroSlide[] = combined.length > 0 ? combined : FALLBACK_SLIDES;

  return (
    <section className="bg-cream-50 pt-3 pb-6 sm:pt-4 sm:pb-8 lg:pt-6 lg:pb-10">
      <Container size="lg">
        <HeroCarousel slides={slides} />
      </Container>
    </section>
  );
}
