import { Container, Section, Card, Button } from "@/components/ui";
import { PinIcon, PhoneIcon, MailIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { localized } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
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
  const [locale, region] = await Promise.all([
    getServerLocale(),
    getServerRegion(),
  ]);
  const regionCopy = await regionCopyFromRegionCode(region, locale);
  const hasPhysicalBranches = regionCopy.countryCode === "UAE";
  const branches = hasPhysicalBranches ? getBranches(locale) : [];
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {localized("Visit us", "زورونا", locale)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl md:text-6xl">
            {hasPhysicalBranches
              ? localized("Branches across the UAE.", "فروعنا في أنحاء الإمارات.", locale)
              : localized(
                  "We deliver across {country}.",
                  "نوصّل إلى جميع أنحاء {country}.",
                  locale,
                  { country: regionCopy.country }
                )}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            {hasPhysicalBranches
              ? localized(
                  "Composed boxes, flower bars, and the full Amoonis Boutique edit — visit us in person.",
                  "علب مؤلَّفة بعناية، وأركان للزهور، وتشكيلة أموونيس بوتيك الكاملة — زورونا في المتجر.",
                  locale
                )
              : localized(
                  "We're online-only in {country} for now — composed boxes and flowers, delivered to your door. No walk-in branch yet.",
                  "نحن حاليًا نعمل أونلاين فقط في {country} — علب وزهور مُنسّقة تصل إلى بابك. لا يوجد فرع للزيارة بعد.",
                  locale,
                  { country: regionCopy.country }
                )}
          </p>
        </Container>
      </section>

      {!hasPhysicalBranches && (
        <Section spacing="md">
          <Card variant="elevated" padding="lg" className="mx-auto flex max-w-xl flex-col items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
              <PinIcon size={18} />
            </span>
            <p className="text-sm leading-relaxed text-ink-500">
              {localized(
                "Reach out and our team will help with delivery, custom arrangements, or anything else.",
                "تواصل معنا وسيساعدك فريقنا في التوصيل أو التنسيقات المخصّصة أو أي استفسار آخر.",
                locale
              )}
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-ink-700 hover:text-bloom-700"
              >
                <PhoneIcon size={14} className="shrink-0" />
                {siteConfig.contact.phone}
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-start gap-2 text-ink-700 hover:text-bloom-700"
              >
                <MailIcon size={14} className="mt-0.5 shrink-0" />
                <span className="wrap-break-word">{siteConfig.contact.email}</span>
              </a>
            </div>
            <Link href={ROUTES.shop} className="contents">
              <Button size="lg" className="mt-3">
                {localized("Shop the boutique", "تسوّق من البوتيك", locale)}
              </Button>
            </Link>
          </Card>
        </Section>
      )}

      {hasPhysicalBranches && (
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
      )}
    </>
  );
}
