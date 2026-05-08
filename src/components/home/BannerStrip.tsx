import Image from "next/image";
import { Container } from "@/components/ui";
import { bannersApi } from "@/features/banners/api/banners.api";

/**
 * Server component — pulls promotional banners from the backend and renders
 * a horizontal scroll-snap strip. Mirrors the mobile app's banner carousel
 * concept (spec §3.5). Returns `null` when there are no banners so the home
 * page degrades gracefully and we don't show an empty band.
 */
export async function BannerStrip() {
  const banners = await bannersApi.list().catch(() => []);
  if (banners.length === 0) return null;

  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="bg-cream-50 pt-2 pb-10 md:pt-4 md:pb-16">
      <Container>
        <div
          aria-label="Featured promotions"
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scroll-smooth md:mx-0 md:gap-6 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {sorted.map((b, i) => (
            <div
              key={b.id}
              className="relative aspect-[5/2] min-w-[88%] shrink-0 snap-start overflow-hidden rounded-3xl bg-blush-100 shadow-(--shadow-soft) sm:min-w-[60%] md:min-w-[48%] lg:min-w-[40%]"
            >
              <Image
                src={b.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 88vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
