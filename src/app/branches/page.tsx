import { Container, Section, Card } from "@/components/ui";
import { PinIcon, PhoneIcon, MailIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Branches" };

const branches = [
  {
    id: "downtown",
    name: "Downtown Dubai",
    address: "Boulevard 1, Downtown Dubai",
    phone: siteConfig.contact.phone,
    hours: "Daily · 10:00 — 22:00",
    note: "Flagship — full edit, gift wrapping, walk-ins welcome.",
  },
  {
    id: "marina",
    name: "Dubai Marina",
    address: "Marina Walk, Dubai Marina",
    phone: siteConfig.contact.phone,
    hours: "Daily · 10:00 — 23:00",
    note: "Boxed gifting, flowers & same-day pickup.",
  },
  {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    address: "Al Wahda, Abu Dhabi",
    phone: siteConfig.contact.phone,
    hours: "Daily · 10:00 — 22:00",
    note: "Full catalogue · personalisation in-store.",
  },
];

export default function BranchesPage() {
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            Visit us
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
            Branches across the UAE.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            Composed boxes, flower bars, and the full Amoonis Boutique edit —
            visit us in person.
          </p>
        </Container>
      </section>

      <Section spacing="md">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <Card key={b.id} variant="elevated" padding="lg" className="flex flex-col gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
                <PinIcon size={18} />
              </span>
              <h2 className="font-display text-2xl font-medium text-ink-900">
                {b.name}
              </h2>
              <p className="text-sm text-ink-600">{b.address}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
                {b.hours}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                {b.note}
              </p>
              <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
                <a
                  href={`tel:${b.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-ink-700 hover:text-bloom-700"
                >
                  <PhoneIcon size={14} />
                  {b.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2 text-ink-700 hover:text-bloom-700"
                >
                  <MailIcon size={14} />
                  {siteConfig.contact.email}
                </a>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
