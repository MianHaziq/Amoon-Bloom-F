import Image from "next/image";
import Link from "next/link";
import { Container, Section, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Our story" };

const principles = [
  {
    title: "Slow, by design.",
    body: "We work with a small set of growers and refresh our edit weekly — never holding standard imports.",
  },
  {
    title: "Composed, not assembled.",
    body: "Each arrangement is hand-tied in our boutique the morning of delivery. No pre-made bouquets.",
  },
  {
    title: "Quietly thoughtful.",
    body: "Recycled wraps, a hand-tied silk ribbon, a message card you'll want to keep.",
  },
];

const milestones = [
  { year: "2019", title: "Boutique opens in Downtown Dubai" },
  { year: "2021", title: "Same-day delivery introduced" },
  { year: "2023", title: "Patisserie & cakes launch" },
  { year: "2026", title: "Corporate gifting becomes a dedicated studio" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              Our story
            </p>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl">
              Quiet flowers,
              <br />
              <span className="italic text-bloom-700">considered always.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              Amoon Bloom began with a single boutique on a quiet Downtown
              street — built around the belief that flowers should be composed
              for the moment, not mass-produced.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={ROUTES.shop} className="contents">
                <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
                  Shop the boutique
                </Button>
              </Link>
              <Link href="/contact" className="contents">
                <Button size="lg" variant="outline">
                  Visit us
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=85"
              alt="Florist composing an arrangement"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Section spacing="lg" tone="default">
        <div className="grid gap-10 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-2xl font-medium text-ink-900">
                {p.title}
              </h3>
              <p className="mt-3 text-ink-600">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="lg" tone="cream">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=900&q=85"
              alt="Boutique interior"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              The boutique
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
              A studio first, a shop second.
            </h2>
            <ul className="mt-6 flex flex-col divide-y divide-ink-100">
              {milestones.map((m) => (
                <li
                  key={m.year}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <span className="font-display text-3xl font-medium text-bloom-700">
                    {m.year}
                  </span>
                  <span className="text-right text-base text-ink-700">
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
