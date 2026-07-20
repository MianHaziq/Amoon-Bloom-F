import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  ThreadsIcon,
} from "@/components/icons";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { getServerT } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { getCachedCategories, getCachedRegions } from "@/services/catalogCache";

/** Resolves a footer shop-column link to a real category, falling back to
 * the full shop page if that category isn't found (e.g. renamed/removed). */
function categoryHref(
  categories: { id: string; title?: string }[],
  pattern: RegExp
) {
  const match = categories.find((c) => pattern.test(c.title ?? ""));
  return match ? ROUTES.category(match.id) : ROUTES.shop;
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  const className = "text-sm text-cream-100/80 transition-colors hover:text-bloom-300";
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export async function Footer() {
  const regionCode = await getServerRegion();
  const [{ t, locale }, categories, regions] = await Promise.all([
    getServerT(),
    getCachedCategories().catch(() => []),
    getCachedRegions().catch(() => []),
  ]);

  // Region-specific legal entity name for the copyright line (admin-editable per
  // region). Falls back to the default region, then the static site config, so
  // regions without one set (or a failed fetch) still render a sensible line.
  const currentRegion =
    regions.find((r) => r.code.toUpperCase() === regionCode?.toUpperCase()) ??
    regions.find((r) => r.isDefault) ??
    null;
  const legalEntity = currentRegion?.legalEntity?.trim() || siteConfig.legalEntity;

  // Country name for the currently selected region (e.g. "Saudi Arabia" on
  // /sa/), used in the footer's address/hours lines instead of a hardcoded
  // "Dubai, UAE" — falls back to the site default when no region resolved.
  const regionCountryName =
    (locale === "ar" ? currentRegion?.name_ar : currentRegion?.name)?.trim() ||
    currentRegion?.name?.trim() ||
    null;

  const columns = [
    {
      title: t("footer.explore"),
      links: [
        { href: ROUTES.home, label: t("common.home") },
        { href: ROUTES.shop, label: t("common.shop") },
        { href: "/#best-sellers", label: t("footer.bestSeller") },
        { href: ROUTES.contact, label: t("nav.contact") },
      ],
    },
    {
      title: t("footer.shop"),
      links: [
        {
          href: categoryHref(categories, /gift\s*box/i),
          label: t("footer.giftBoxes"),
        },
        {
          href: categoryHref(categories, /flower\s*bouquet/i),
          label: t("footer.flowerBouquets"),
        },
        {
          href: categoryHref(categories, /flower\s*mug/i),
          label: t("footer.flowerMugs"),
        },
        {
          href: categoryHref(categories, /newborn/i),
          label: t("footer.newbornGifts"),
        },
      ],
    },
    {
      title: t("footer.care"),
      links: [
        { href: ROUTES.terms, label: t("footer.termsConditions") },
        { href: ROUTES.refundPolicy, label: t("footer.refundReturnPolicy") },
        { href: ROUTES.productDisclaimer, label: t("footer.productDisclaimer") },
        { href: ROUTES.privacy, label: t("footer.privacyPolicy") },
        { href: ROUTES.shippingPolicy, label: t("footer.shippingPolicy") },
      ],
    },
  ];

  // Region-specific contact info (admin-editable per region), same fallback
  // convention as legalEntity above. Address/hours specifically fall back to
  // the pre-existing behavior (region country name / the {city}-templated
  // hours string) rather than jumping straight to siteConfig — that's what
  // every region without an explicit override already shows today.
  const contactPhone = currentRegion?.contactPhone?.trim() || siteConfig.contact.phone;
  const contactEmail = currentRegion?.contactEmail?.trim() || siteConfig.contact.email;
  const contactAddress =
    (locale === "ar" ? currentRegion?.address_ar?.trim() : undefined) ||
    currentRegion?.address?.trim() ||
    regionCountryName ||
    siteConfig.contact.address;
  const contactHours =
    (locale === "ar" ? currentRegion?.hours_ar?.trim() : undefined) ||
    currentRegion?.hours?.trim() ||
    t("footer.hoursTemplate", { city: regionCountryName ?? "" });

  const contactLines = [
    { href: `tel:${contactPhone.replace(/\s/g, "")}`, label: contactPhone.replace(/\s/g, "") },
    { href: `mailto:${contactEmail}`, label: contactEmail },
    { href: null, label: contactAddress },
    { href: null, label: contactHours },
  ];

  const socials = [
    { href: siteConfig.links.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.links.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.links.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: siteConfig.links.threads, label: "Threads", Icon: ThreadsIcon },
  ];

  return (
    <footer className="bg-[#170b10] text-cream-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="max-w-lg">
          <Link href={ROUTES.home} className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt={siteConfig.name} className="h-10 w-auto sm:h-12" />
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-cream-100/70">
            {t("footer.brandDesc", { country: regionCountryName ?? "" })}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-cream-100/80 transition-colors hover:bg-white/15 hover:text-bloom-300"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10" />

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-400">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-400">
              {t("nav.contact")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {contactLines.map((line) => (
                <li key={line.label} className="flex items-start gap-2 text-sm text-cream-100/80">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cream-100/50" />
                  {line.href ? (
                    <a href={line.href} className="transition-colors hover:text-bloom-300">
                      {line.label}
                    </a>
                  ) : (
                    <span>{line.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
        <div className="rounded-2xl border border-white/10 px-6 py-4 text-xs text-cream-100/50">
          © {new Date().getFullYear()} {legalEntity}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
