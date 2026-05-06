import Image from "next/image";
import Link from "next/link";
import { Container, Section, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "About us" };

const principles = [
  {
    title: "Composed, not assembled.",
    body: "Every Amoonis Boutique box is hand-packed in our Dubai studio the morning of delivery — no pre-made gift sets, no shortcuts.",
  },
  {
    title: "A box for the moment.",
    body: "From graduations to Eid, newborns to anniversaries — we curate each box for the occasion, not the lowest common denominator.",
  },
  {
    title: "Quietly thoughtful.",
    body: "A printed message card, a hand-tied ribbon, recycled wraps. The details are always free, and always considered.",
  },
];

const milestones = [
  { year: "2020", title: "Amoonis Boutique opens in Dubai" },
  { year: "2022", title: "Newborn & graduation editions launch" },
  { year: "2024", title: "Same-day UAE-wide delivery" },
  { year: "2026", title: "VIBE by Amoon — self-care line" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              About us
            </p>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl">
              Hand-packed,
              <br />
              <span className="italic text-bloom-700">always considered.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              Amoonis Boutique began as a small atelier in Dubai composing gift
              boxes for the moments that matter — graduations, Eid, newborns,
              and the quiet days in between. Today the boutique ships across
              the UAE, but every box is still composed by hand.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={ROUTES.shop} className="contents">
                <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
                  Shop the boutique
                </Button>
              </Link>
              <Link href={ROUTES.branches} className="contents">
                <Button size="lg" variant="outline">
                  Visit a branch
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85"
              alt="Hand-composed Amoonis Boutique gift box"
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
          <div className="relative aspect-3/4 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"
              alt="Inside the Amoonis Boutique studio"
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
