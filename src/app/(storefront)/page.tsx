import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeSections } from "@/components/home/HomeSections";
import { Container } from "@/components/ui";

// --- Temporarily disabled: sections backed by mock/placeholder (not real
// backend) data. Re-enable once wired to real content so the home page only
// shows genuine, on-brand data. ---
// import { OccasionRail } from "@/components/home/OccasionRail";
// import { Editorial } from "@/components/home/Editorial";
// import { Testimonials } from "@/components/home/Testimonials";
// import { InstagramStrip } from "@/components/home/InstagramStrip";

/**
 * Each section is an async Server Component that fetches from the (region-
 * cached) catalog layer. Wrapping them in <Suspense> lets Next stream the page
 * shell + static strips immediately and swap in each section as its data lands,
 * instead of blocking first byte on the slowest backend call. Fallbacks reserve
 * the section's height to avoid layout shift.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      {/* Categories sit directly under the banner so shoppers land straight
          on what they can browse; the trust strip follows. */}
      <Suspense fallback={<RowFallback cards={3} />}>
        <CategoryShowcase />
      </Suspense>
      <TrustStrip />
      {/* <OccasionRail /> — mock occasions data */}
      <Suspense fallback={<RowFallback cards={4} />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<RowFallback cards={4} />}>
        <HomeSections />
      </Suspense>
      {/* <Editorial /> — hardcoded stock imagery/copy */}
      {/* <Testimonials /> — placeholder reviews */}
      {/* <InstagramStrip /> — placeholder Instagram feed */}
    </>
  );
}

function HeroFallback() {
  return (
    <div
      className="skeleton min-h-[60vh] w-full lg:min-h-[70vh]"
      aria-hidden
    />
  );
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
