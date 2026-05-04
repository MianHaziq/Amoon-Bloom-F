import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui";
import { occasions, type Occasion } from "@/features/occasions/data/occasions.mock";
import { cn } from "@/lib/cn";

const accentRing: Record<Occasion["accentColor"], string> = {
  blush: "ring-blush-200",
  bloom: "ring-bloom-200",
  cream: "ring-cream-200",
  ink: "ring-ink-200",
};

export function OccasionRail() {
  return (
    <Section spacing="md" tone="default">
      <SectionHeader
        eyebrow="Shop by moment"
        title="A gift for every occasion."
        description="From the quietly thoughtful to the unforgettable celebration — composed by our team for the moment."
      />
      <div className="mt-10 -mx-4 overflow-x-auto pb-4 px-4 no-scrollbar lg:mx-0 lg:px-0">
        <ul className="flex gap-5 lg:grid lg:grid-cols-7 lg:gap-4">
          {occasions.map((occasion) => (
            <li key={occasion.id} className="shrink-0">
              <Link
                href={`/shop?occasion=${occasion.slug}`}
                className="group flex w-32 flex-col items-center gap-3 lg:w-auto"
              >
                <span
                  className={cn(
                    "relative inline-flex aspect-square w-28 overflow-hidden rounded-full ring-2 ring-offset-4 ring-offset-cream-50 transition-all duration-500 group-hover:scale-[1.04] group-hover:ring-offset-8 lg:w-full",
                    accentRing[occasion.accentColor]
                  )}
                >
                  <Image
                    src={occasion.imageUrl}
                    alt={occasion.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 12vw, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>
                <div className="text-center">
                  <p className="font-display text-base font-medium leading-tight text-ink-900">
                    {occasion.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {occasion.tagline}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
