import Link from "next/link";
import { Container } from "@/components/ui";
import {
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/icons";
import {
  VisaMark,
  MastercardMark,
  ApplePayMark,
} from "@/components/icons/payments";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { NewsletterForm } from "./NewsletterForm";
import { getServerT } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";

export async function Footer() {
  const [{ t, locale }, region] = await Promise.all([
    getServerT(),
    getServerRegion(),
  ]);
  const regionCopy = regionCopyFromRegionCode(region, locale);

  const footerNav = [
    { href: ROUTES.shop, label: t("footer.menu") },
    { href: ROUTES.orderStatus, label: t("footer.orderStatus") },
    { href: ROUTES.about, label: t("footer.aboutUs") },
    { href: ROUTES.privacy, label: t("footer.privacyPolicy") },
    { href: ROUTES.branches, label: t("footer.branches") },
  ];

  const sections = [
    {
      title: t("footer.shop"),
      links: [
        { href: ROUTES.shop, label: t("footer.allGiftBoxes") },
        { href: ROUTES.category("graduation-boxes"), label: t("footer.graduationBoxes") },
        { href: ROUTES.category("eid-box"), label: t("footer.eidBox") },
        { href: ROUTES.category("flowers"), label: t("footer.flowers") },
        { href: ROUTES.category("newborn-gifts"), label: t("footer.newbornGifts") },
      ],
    },
    {
      title: t("footer.careBeauty"),
      links: [
        { href: ROUTES.category("makeup-and-care-gifts"), label: t("footer.makeupCare") },
        {
          href: ROUTES.category("gifts-of-pampering-and-relaxation"),
          label: t("footer.pampering"),
        },
        { href: ROUTES.category("distributions"), label: t("footer.distributions") },
      ],
    },
    {
      title: t("footer.service"),
      links: [
        { href: ROUTES.contact, label: t("footer.care") },
        { href: ROUTES.branches, label: t("footer.visitBranch") },
        { href: ROUTES.orderStatus, label: t("footer.orderStatus") },
        { href: "/faq", label: t("footer.faq") },
      ],
    },
  ];

  return (
    <footer className="bg-black text-cream-100">
      {/* Newsletter strip */}
      <Container className="grid gap-10 border-b border-white/10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-300">
            {t("footer.newsletterEyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
            {t("footer.newsletterHeadline")}
          </h2>
          <p className="mt-3 max-w-md text-sm text-cream-100/70">
            {t("footer.newsletterBody")}
          </p>
        </div>
        <NewsletterForm />
      </Container>

      {/* Link grid */}
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href={ROUTES.home} className="inline-flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 font-display text-base font-semibold tracking-wide text-bloom-700">
              A
            </span>
            <span className="font-display text-2xl font-medium tracking-tight">
              <span className="text-cream-50">Amoonis</span>{" "}
              <span className="text-bloom-300">Boutique</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-cream-100/70">
            {t("footer.brandDesc", { country: regionCopy.country })}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-cream-100/80">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-2 hover:text-bloom-300"
            >
              <MailIcon size={16} className="text-bloom-300" />
              {siteConfig.contact.email}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 hover:text-bloom-300"
            >
              <PhoneIcon size={16} className="text-bloom-300" />
              {siteConfig.contact.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <PinIcon size={16} className="text-bloom-300" />
              {regionCopy.city}, {regionCopy.country}
            </span>
          </div>
        </div>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100/60">
              {section.title}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-100/85 transition-colors hover:text-bloom-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      {/* Bottom row — utility nav · social · payments · powered-by */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center gap-6 py-8 md:flex-row md:justify-between">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.12em] text-cream-100/70">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-bloom-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-cream-100/80">
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-bloom-300"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href={siteConfig.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-bloom-300"
            >
              <WhatsAppIcon size={16} />
            </a>
            <a
              href={siteConfig.links.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-bloom-300"
            >
              <TikTokIcon size={16} />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <VisaMark className="rounded-md" />
            <MastercardMark className="rounded-md" />
            <ApplePayMark className="rounded-md" />
          </div>
        </Container>
      </div>

      {/* Powered-by + copyright */}
      <div className="border-t border-white/10 bg-black">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-[0.7rem] uppercase tracking-[0.18em] text-cream-100/50 md:flex-row">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
          </span>
          <span className="text-cream-100/40">
            {t("footer.poweredBy")}{" "}
            <span className="text-cream-100/70">{siteConfig.poweredBy}</span>
          </span>
        </Container>
      </div>
    </footer>
  );
}
