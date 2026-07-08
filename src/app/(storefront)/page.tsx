import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { HomeSections } from "@/components/home/HomeSections";
import { TrustStrip } from "@/components/home/TrustStrip";
import { BrandStory } from "@/components/home/BrandStory";
import { SupportSection } from "@/components/home/SupportSection";
import { Container } from "@/components/ui";

/**
 * Home page — section order mirrors the client's live site:
 *   Hero → promo banner → categories → best sellers → new arrivals
 *        → trust strip → brand story → support.
 * Data-backed sections stream inside <Suspense> so the shell paints instantly.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>

      <PromoBanner />

      <Suspense fallback={<RowFallback cards={4} />}>
        <CategoryShowcase />
      </Suspense>

      {/* Admin-managed product rails (Best sellers, New arrivals, …) in the
          order set in the admin Sections screen. */}
      <Suspense fallback={<RowFallback cards={4} />}>
        <HomeSections />
      </Suspense>

      <TrustStrip />

      <BrandStory />

      <SupportSection />
    </>
  );
}

function HeroFallback() {
  return <div className="skeleton min-h-[60vh] w-full lg:min-h-[70vh]" aria-hidden />;
}

function RowFallback({ cards }: { cards: 3 | 4 }) {
  return (
    <section className="py-14 lg:py-20" aria-hidden>
      <Container>
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div
          className={
            "mt-10 grid gap-5 lg:gap-6 " +
            (cards === 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-4")
          }
        >
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="skeleton aspect-4/5 w-full rounded-2xl" />
          ))}
        </div>
      </Container>
    </section>
  );
}
