import Image from "next/image";
import Link from "next/link";
import { Container, Section, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { getServerLocale } from "@/i18n/server";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "About us" };

const principles = (locale: Locale) => [
  {
    title: localized("Composed, not assembled.", "مؤلَّفة بعناية، لا مجمّعة.", locale),
    body: localized(
      "Every Amoonis Boutique box is hand-packed in our Dubai studio the morning of delivery — no pre-made gift sets, no shortcuts.",
      "تُغلَّف كل علبة من أموونيس بوتيك يدويًا في استوديونا بدبي صباح يوم التسليم — دون مجموعات هدايا جاهزة، ودون اختصارات.",
      locale
    ),
  },
  {
    title: localized("A box for the moment.", "علبة تليق باللحظة.", locale),
    body: localized(
      "From graduations to Eid, newborns to anniversaries — we curate each box for the occasion, not the lowest common denominator.",
      "من حفلات التخرّج إلى العيد، ومن المواليد الجدد إلى ذكرى الزواج — ننسّق كل علبة لتناسب المناسبة، لا لتلائم أدنى قاسم مشترك.",
      locale
    ),
  },
  {
    title: localized("Quietly thoughtful.", "لمسات صادقة بلا ضجيج.", locale),
    body: localized(
      "A printed message card, a hand-tied ribbon, recycled wraps. The details are always free, and always considered.",
      "بطاقة رسالة مطبوعة، وشريطة معقودة يدويًا، وأغلفة قابلة لإعادة التدوير. التفاصيل مجانية دائمًا، ومدروسة دائمًا.",
      locale
    ),
  },
];

const milestones = (locale: Locale) => [
  { year: "2020", title: localized("Amoonis Boutique opens in Dubai", "افتتاح أموونيس بوتيك في دبي", locale) },
  { year: "2022", title: localized("Newborn & graduation editions launch", "إطلاق إصدارَي المواليد والتخرّج", locale) },
  { year: "2024", title: localized("Same-day UAE-wide delivery", "التوصيل في اليوم نفسه على مستوى الإمارات", locale) },
  { year: "2026", title: localized("VIBE by Amoon — self-care line", "VIBE من أمون — خط العناية بالذات", locale) },
];

export default async function AboutPage() {
  const locale = await getServerLocale();
  const principlesList = principles(locale);
  const milestonesList = milestones(locale);
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-12 lg:pt-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              {localized("About us", "من نحن", locale)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {localized("Hand-packed,", "مُغلَّفة يدويًا،", locale)}
              <br />
              <span className="italic text-bloom-700">
                {localized("always considered.", "ومدروسة دائمًا.", locale)}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-600">
              {localized(
                "Amoonis Boutique began as a small atelier in Dubai composing gift boxes for the moments that matter — graduations, Eid, newborns, and the quiet days in between. Today the boutique ships across the UAE, but every box is still composed by hand.",
                "بدأ أموونيس بوتيك ورشةً صغيرة في دبي تؤلّف علب الهدايا للحظات المهمة — التخرّج والعيد والمواليد الجدد والأيام الهادئة بينها. واليوم يوصّل البوتيك إلى جميع أنحاء الإمارات، لكن كل علبة لا تزال تُؤلَّف يدويًا.",
                locale
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={ROUTES.shop} className="contents">
                <Button
                  size="lg"
                  trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
                >
                  {localized("Shop the boutique", "تسوّق من البوتيك", locale)}
                </Button>
              </Link>
              <Link href={ROUTES.branches} className="contents">
                <Button size="lg" variant="outline">
                  {localized("Visit a branch", "زُر أحد الفروع", locale)}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85"
              alt={localized(
                "Hand-composed Amoonis Boutique gift box",
                "علبة هدايا من أموونيس بوتيك مؤلَّفة يدويًا",
                locale
              )}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Section spacing="lg" tone="default">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {principlesList.map((p) => (
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
              alt={localized(
                "Inside the Amoonis Boutique studio",
                "من داخل استوديو أموونيس بوتيك",
                locale
              )}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              {localized("The boutique", "البوتيك", locale)}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl md:text-5xl">
              {localized(
                "A studio first, a shop second.",
                "استوديو في المقام الأول، ومتجر في المقام الثاني.",
                locale
              )}
            </h2>
            <ul className="mt-6 flex flex-col divide-y divide-ink-100">
              {milestonesList.map((m) => (
                <li
                  key={m.year}
                  className="flex items-baseline justify-between gap-4 py-4 sm:gap-6"
                >
                  <span className="shrink-0 font-display text-2xl font-medium text-bloom-700 sm:text-3xl">
                    {m.year}
                  </span>
                  <span className="text-end text-sm text-ink-700 sm:text-base">
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
