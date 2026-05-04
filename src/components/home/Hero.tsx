import Image from "next/image";
import Link from "next/link";
import { Container, Button, Badge } from "@/components/ui";
import { ArrowRight, SparkleIcon, TruckIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-blush-50">
      {/* Decorative blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[40rem] w-[40rem] rounded-full bg-bloom-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -bottom-40 h-[30rem] w-[30rem] rounded-full bg-cream-200/60 blur-3xl"
      />

      <Container className="relative grid gap-12 py-16 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16 md:py-24 lg:py-32">
        <div className="flex flex-col gap-6">
          <Badge tone="bloom" className="w-fit">
            <SparkleIcon size={12} />
            New season · Spring capsule
          </Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl">
            Bloom in
            <br />
            every <span className="italic text-bloom-700">moment</span>.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-600">
            Hand-arranged flowers, considered gifts, and same-day delivery for
            the moments that matter — designed in the boutique.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={ROUTES.shop} className="contents">
              <Button size="xl" trailingIcon={<ArrowRight size={18} />}>
                Shop the boutique
              </Button>
            </Link>
            <Link href="/about" className="contents">
              <Button size="xl" variant="outline">
                Our story
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-ink-500">
            <TruckIcon size={18} className="text-bloom-700" />
            <span>
              <span className="font-medium text-ink-900">Same-day delivery</span>{" "}
              · order before 6 PM in Dubai
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Main image */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-cream-100 shadow-(--shadow-lift)">
            <Image
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1400&q=85"
              alt="Hand-tied peony bouquet by Amoon Bloom"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-6 -left-6 flex max-w-xs items-center gap-3 rounded-2xl bg-white p-4 shadow-(--shadow-lift) md:-bottom-10 md:-left-10">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=200&q=80"
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bloom-700">
                Florist&rsquo;s pick
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink-900">
                Rosewater Peonies
              </p>
            </div>
          </div>

          {/* Top right pill */}
          <div className="absolute -right-3 top-6 hidden rounded-full bg-white/95 px-4 py-2 text-xs font-semibold tracking-wide text-ink-700 shadow-(--shadow-soft) backdrop-blur-md md:block">
            ★ 4.9 · 2,400 reviews
          </div>
        </div>
      </Container>
    </section>
  );
}
