import { bannersApi } from "@/features/banners/api/banners.api";
import { getServerRegion } from "@/services/serverRegion";
import { HeroCarousel } from "./HeroCarousel";

/**
 * Hero — full-bleed slideshow built on the same promotional banners that used
 * to live in the strip below. The brand identity (badge + headline + CTAs) is
 * pinned to a glass card so it stays consistent while the imagery cycles.
 *
 * Falls back to a curated set of editorial images if the banners endpoint
 * fails or returns nothing, so the homepage never opens with an empty hero.
 */
const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=2400&q=85",
  },
  {
    id: "fallback-2",
    url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=2400&q=85",
  },
  {
    id: "fallback-3",
    url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=2400&q=85",
  },
];

export async function Hero() {
  const region = await getServerRegion();
  const banners = await bannersApi.list(region).catch(() => []);
  const slides =
    banners.length > 0
      ? [...banners]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ id, url }) => ({ id, url }))
      : FALLBACK_SLIDES;

  return <HeroCarousel slides={slides} />;
}
