import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeSections } from "@/components/home/HomeSections";

// --- Temporarily disabled: sections backed by mock/placeholder (not real
// backend) data. Re-enable once wired to real content so the home page only
// shows genuine, on-brand data. ---
// import { OccasionRail } from "@/components/home/OccasionRail";
// import { Editorial } from "@/components/home/Editorial";
// import { Testimonials } from "@/components/home/Testimonials";
// import { InstagramStrip } from "@/components/home/InstagramStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      {/* <OccasionRail /> — mock occasions data */}
      <CategoryShowcase />
      <FeaturedProducts />
      <HomeSections />
      {/* <Editorial /> — hardcoded stock imagery/copy */}
      {/* <Testimonials /> — placeholder reviews */}
      {/* <InstagramStrip /> — placeholder Instagram feed */}
    </>
  );
}
