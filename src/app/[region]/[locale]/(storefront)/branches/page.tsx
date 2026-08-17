import { Container, Section, Card, Button } from "@/components/ui";
import { PinIcon, PhoneIcon, MailIcon } from "@/components/icons";
import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { getCachedBranches } from "@/services/catalogCache";
import { localized } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
import { regionContactFromRegionCode } from "@/features/location/regionContact";
import { ROUTES } from "@/constants/routes";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import type { Locale } from "@/store/slices/ui.slice";
import type { ApiBranch } from "@/features/regions/types";

export const metadata = { title: "Branches" };

/** Pick a branch field for the current locale, falling back to the English value. */
function pick(en: string | null, ar: string | null, locale: Locale): string {
  return ((locale === "ar" ? ar : null) || en || "").trim();
}

export default async function BranchesPage() {
  const [locale, region] = await Promise.all([getServerLocale(), getServerRegion()]);
  const [regionCopy, contact, branches] = await Promise.all([
    regionCopyFromRegionCode(region, locale),
    regionContactFromRegionCode(region, locale),
    getCachedBranches(region).catch<ApiBranch[]>(() => []),
  ]);
  const hasPhysicalBranches = branches.length > 0;

  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {localized("Visit us", "زورونا", locale)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl md:text-6xl">
            {hasPhysicalBranches
              ? localized("Our branches.", "فروعنا.", locale)
              : localized(
                  "We deliver across {country}.",
                  "نوصل إلى جميع أنحاء {country}.",
                  locale,
                  { country: regionCopy.country }
                )}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            {hasPhysicalBranches
              ? localized(
                  "Composed boxes, flower bars, and the full Amoonis Boutique edit — visit us in person.",
                  "علب مؤلفة بعناية، وأركان للزهور، وتشكيلة أموونيس بوتيك الكاملة — زورونا في المتجر.",
                  locale
                )
              : localized(
                  "We're online-only in {country} for now — composed boxes and flowers, delivered to your door. No walk-in branch yet.",
                  "نحن حاليا نعمل أونلاين فقط في {country} — علب وزهور منسقة تصل إلى بابك. لا يوجد فرع للزيارة بعد.",
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
                "تواصل معنا وسيساعدك فريقنا في التوصيل أو التنسيقات المخصصة أو أي استفسار آخر.",
                locale
              )}
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 font-medium text-bloom-700 hover:text-bloom-800"
              >
                <PhoneIcon size={14} className="shrink-0" />
                <span dir="ltr" className="[unicode-bidi:isolate]">{contact.phone}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-start gap-2 font-medium text-bloom-700 hover:text-bloom-800"
              >
                <MailIcon size={14} className="mt-0.5 shrink-0" />
                <span className="wrap-break-word">{contact.email}</span>
              </a>
            </div>
            <LocalizedLink href={ROUTES.shop} className="contents">
              <Button size="lg" className="mt-3">
                {localized("Shop the boutique", "تسوق من البوتيك", locale)}
              </Button>
            </LocalizedLink>
          </Card>
        </Section>
      )}

      {hasPhysicalBranches && (
        <Section spacing="md">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => {
              const name = pick(b.name, b.name_ar, locale);
              const address = pick(b.address, b.address_ar, locale);
              const hours = pick(b.hours, b.hours_ar, locale);
              const note = pick(b.note, b.note_ar, locale);
              const phone = (b.phone || contact.phone).trim();
              return (
                <Card key={b.id} variant="elevated" padding="lg" className="flex flex-col gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
                    <PinIcon size={18} />
                  </span>
                  <h2 className="font-display text-2xl font-medium text-ink-900">{name}</h2>
                  {address ? <p className="text-sm text-ink-600">{address}</p> : null}
                  {hours ? (
                    <p className="text-xs uppercase tracking-[0.12em] text-ink-400">{hours}</p>
                  ) : null}
                  {note ? <p className="mt-1 text-sm leading-relaxed text-ink-500">{note}</p> : null}
                  <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-2 font-medium text-bloom-700 hover:text-bloom-800"
                      >
                        <PhoneIcon size={14} className="shrink-0" />
                        <span dir="ltr" className="[unicode-bidi:isolate]">{phone}</span>
                      </a>
                    ) : null}
                    {b.mapUrl ? (
                      <a
                        href={b.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-bloom-700 hover:text-bloom-800"
                      >
                        <PinIcon size={14} className="shrink-0" />
                        {localized("View on map", "عرض على الخريطة", locale)}
                      </a>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
