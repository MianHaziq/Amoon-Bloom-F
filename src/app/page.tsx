import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";

const highlights = [
  {
    title: "Curated edits",
    description:
      "Capsule collections refreshed every season — every piece earns its place.",
  },
  {
    title: "Considered materials",
    description:
      "Natural fibres, traceable sourcing, and craftsmanship that lasts.",
  },
  {
    title: "Concierge support",
    description:
      "Free returns, fitting advice, and human help whenever you need it.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Container className="grid gap-12 py-24 md:grid-cols-2 md:items-center md:py-32">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              New season · 2026
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl md:text-6xl dark:text-zinc-50">
              Quietly considered
              <br />
              everyday essentials.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.shop}>
                <Button size="lg">Shop the edit</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Our story
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700">
            <div className="absolute inset-0 flex items-end p-8">
              <div className="rounded-2xl bg-white/80 p-6 backdrop-blur-md dark:bg-zinc-950/80">
                <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Featured
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Linen capsule, vol. III
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-200 py-20 dark:border-zinc-800">
        <Container className="grid gap-10 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {item.title}
              </p>
              <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
                {item.description}
              </p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
