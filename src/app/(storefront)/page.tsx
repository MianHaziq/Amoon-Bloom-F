import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { OccasionRail } from "@/components/home/OccasionRail";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeSections } from "@/components/home/HomeSections";
import { Editorial } from "@/components/home/Editorial";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramStrip } from "@/components/home/InstagramStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <OccasionRail />
      <CategoryShowcase />
      <FeaturedProducts />
      <HomeSections />
      <Editorial />
      <Testimonials />
      <InstagramStrip />
    </>
  );
}
