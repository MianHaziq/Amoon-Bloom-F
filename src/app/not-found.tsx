import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";
import {
  buildPrefix,
  withPrefix,
  DEFAULT_REGION_SLUG,
} from "@/features/location/routing";

export default async function NotFound() {
  const locale = await getServerLocale();
  // This boundary also renders for an INVALID region slug (the storefront layout
  // 404s on one), so links point at the DEFAULT region — never the bad slug.
  const prefix = buildPrefix(DEFAULT_REGION_SLUG, locale);
  const home = withPrefix(prefix, ROUTES.home);
  const shop = withPrefix(prefix, ROUTES.shop);
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
        {t(locale, "notFound.eyebrow")}
      </p>
      <h1 className="mt-3 font-display text-7xl font-medium leading-none text-ink-900 md:text-8xl">
        404
      </h1>
      <p className="mt-4 max-w-md text-base text-ink-500">
        {t(locale, "notFound.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={home} className="contents">
          <Button size="lg" trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}>
            {t(locale, "notFound.backHome")}
          </Button>
        </Link>
        <Link href={shop} className="contents">
          <Button size="lg" variant="outline">
            {t(locale, "common.browseBoutique")}
          </Button>
        </Link>
      </div>
    </Container>
  );
}
