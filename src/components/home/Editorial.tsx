import Image from "next/image";
import Link from "next/link";
import { Container, Badge, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";

export function Editorial() {
  return (
    <section className="bg-ink-900 text-cream-50">
      <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28 lg:py-36">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=85"
            alt="Florist composing an arrangement"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink-900/40 to-transparent" />
        </div>
        <div className="flex flex-col gap-6">
          <Badge tone="blush" className="w-fit">
            The Boutique
          </Badge>
          <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
            Slow flowers,
            <br />
            <span className="italic text-bloom-300">considered always.</span>
          </h2>
          <p className="max-w-md text-lg text-cream-100/80">
            We work with a small set of growers in the UAE, France, and
            Ecuador — choosing seasonal blooms over imported standards. Every
            arrangement is composed in our Downtown Dubai studio the morning of
            delivery.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/about" className="contents">
              <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
                Visit the boutique
              </Button>
            </Link>
            <Link href="/journal" className="contents">
              <Button size="lg" variant="outline" className="border-white/20 text-cream-50 hover:bg-white/10">
                Read the journal
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
