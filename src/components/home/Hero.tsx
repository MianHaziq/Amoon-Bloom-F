import { getCachedBanners } from "@/services/catalogCache";
import { getServerRegion } from "@/services/serverRegion";
import { siteConfig } from "@/config/site";
import { bannerMediaKind } from "@/features/banners/media";
import { Container } from "@/components/ui";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

/**
 * Hero — inset 16:9 slideshow, padded to align with the product grid container.
 *
 * Composition — admin-managed WEB banners are the SOURCE OF TRUTH, so the storefront
 * hero matches the admin panel exactly:
 *   1. When any WEB banners exist (images and/or videos, in their admin order) they ARE
 *      the hero. Web-only; the mobile app keeps its own MOBILE image banners.
 *   2. FALLBACK (no web banner configured): the hard-coded brand videos
 *      (siteConfig.heroVideos) so a fresh store still has a hero.
 *   3. FALLBACK (neither): a curated editorial image set keeps the hero non-empty.
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

  // Brand videos are a FALLBACK only — used when the admin has configured no web banner,
  // so the storefront hero reflects exactly what's in the admin panel when banners exist.
  const videoSlides: HeroSlide[] = (siteConfig.heroVideos ?? []).map(
    (url, i) => ({ id: `hero-video-${i}`, kind: "video", url })
  );

  // Admin banners win; else brand videos; else the editorial image set (never empty).
  const slides: HeroSlide[] =
    bannerSlides.length > 0
      ? bannerSlides
      : videoSlides.length > 0
        ? videoSlides
        : FALLBACK_SLIDES;

  return (
    <section className="bg-cream-50 pt-3 pb-6 sm:pt-4 sm:pb-8 lg:pt-6 lg:pb-10">
      <Container size="lg">
        <HeroCarousel slides={slides} />
      </Container>
    </section>
  );
}
