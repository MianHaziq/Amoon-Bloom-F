import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { Reveal } from "@/components/motion/primitives";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

/**
 * Secondary hero band ("The extra mile, always.") — mirrors the client's
 * promotional banner beneath the hero. Deep-rose gradient, brand voice, single
 * CTA to the shop.
 */
export async function PromoBanner() {
  const locale = await getServerLocale();
  return (
    <section className="bg-gradient-to-br from-bloom-600 to-bloom-800 text-white">
      <Container className="py-14 md:py-20">
        <Reveal>
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bloom-100">
                {t(locale, "home.promoEyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl lg:text-5xl">
                {t(locale, "home.promoTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-sm text-bloom-50/90 md:text-base">
                {t(locale, "home.promoSubtitle")}
              </p>
            </div>
            <Link href={ROUTES.shop} className="contents">
              <Button
                variant="secondary"
                size="lg"
                className="shrink-0 bg-white text-bloom-800 hover:bg-cream-50"
                trailingIcon={<ArrowRight size={18} className="rtl:-scale-x-100" />}
              >
                {t(locale, "home.promoCta")}
              </Button>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
