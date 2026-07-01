import { Container, Section, Card } from "@/components/ui";
import { PinIcon, PhoneIcon, MailIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "Branches" };

const getBranches = (locale: Locale) => [
  {
    id: "downtown",
    name: localized("Downtown Dubai", "وسط مدينة دبي", locale),
    address: localized("Boulevard 1, Downtown Dubai", "بوليفارد 1، وسط مدينة دبي", locale),
    phone: siteConfig.contact.phone,
    hours: localized("Daily · 10:00 — 22:00", "يوميًا · 10:00 — 22:00", locale),
    note: localized(
      "Flagship — full edit, gift wrapping, walk-ins welcome.",
      "الفرع الرئيسي — التشكيلة الكاملة، وتغليف الهدايا، والزيارات دون موعد مرحّب بها.",
      locale
    ),
  },
  {
    id: "marina",
    name: localized("Dubai Marina", "مرسى دبي", locale),
    address: localized("Marina Walk, Dubai Marina", "ممشى المرسى، مرسى دبي", locale),
    phone: siteConfig.contact.phone,
    hours: localized("Daily · 10:00 — 23:00", "يوميًا · 10:00 — 23:00", locale),
    note: localized(
      "Boxed gifting, flowers & same-day pickup.",
      "هدايا معلَّبة وزهور واستلام في اليوم نفسه.",
      locale
    ),
  },
  {
    id: "abu-dhabi",
    name: localized("Abu Dhabi", "أبوظبي", locale),
    address: localized("Al Wahda, Abu Dhabi", "الوحدة، أبوظبي", locale),
    phone: siteConfig.contact.phone,
    hours: localized("Daily · 10:00 — 22:00", "يوميًا · 10:00 — 22:00", locale),
    note: localized(
      "Full catalogue · personalisation in-store.",
      "التشكيلة الكاملة · تخصيص داخل المتجر.",
      locale
    ),
  },
];

export default async function BranchesPage() {
  const locale = await getServerLocale();
  const branches = getBranches(locale);
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {localized("Visit us", "زورونا", locale)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl md:text-6xl">
            {localized("Branches across the UAE.", "فروعنا في أنحاء الإمارات.", locale)}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            {localized(
              "Composed boxes, flower bars, and the full Amoonis Boutique edit — visit us in person.",
              "علب مؤلَّفة بعناية، وأركان للزهور، وتشكيلة أموونيس بوتيك الكاملة — زورونا في المتجر.",
              locale
            )}
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
                  <PhoneIcon size={14} className="shrink-0" />
                  {b.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-start gap-2 text-ink-700 hover:text-bloom-700"
                >
                  <MailIcon size={14} className="mt-0.5 shrink-0" />
                  <span className="wrap-break-word">{siteConfig.contact.email}</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
