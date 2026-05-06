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

const footerNav = [
  { href: ROUTES.shop, label: "Menu" },
  { href: ROUTES.orderStatus, label: "Order status" },
  { href: ROUTES.about, label: "About us" },
  { href: ROUTES.privacy, label: "Privacy policy" },
  { href: ROUTES.branches, label: "Branches" },
];

const sections = [
  {
    title: "Shop",
    links: [
      { href: ROUTES.shop, label: "All gift boxes" },
      { href: ROUTES.category("graduation-boxes"), label: "Graduation boxes" },
      { href: ROUTES.category("eid-box"), label: "EID BOX" },
      { href: ROUTES.category("flowers"), label: "Flowers" },
      { href: ROUTES.category("newborn-gifts"), label: "Newborn gifts" },
    ],
  },
  {
    title: "Care & Beauty",
    links: [
      { href: ROUTES.category("makeup-and-care-gifts"), label: "Makeup & care" },
      {
        href: ROUTES.category("gifts-of-pampering-and-relaxation"),
        label: "Pampering & relaxation",
      },
      { href: ROUTES.category("distributions"), label: "Distributions" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: ROUTES.contact, label: "Customer care" },
      { href: ROUTES.branches, label: "Visit a branch" },
      { href: ROUTES.orderStatus, label: "Order status" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-100">
      {/* Newsletter strip */}
      <Container className="grid gap-10 border-b border-white/10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-300">
            Stay in the boutique
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
            New box drops,
            <br />
            in your inbox.
          </h2>
          <p className="mt-3 max-w-md text-sm text-cream-100/70">
            Be first to see seasonal boxes, member-only edits, and behind the
            scenes from the Amoonis Boutique studio.
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
            {siteConfig.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-cream-100/80">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-2 hover:text-cream-50"
            >
              <MailIcon size={16} className="text-bloom-300" />
              {siteConfig.contact.email}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 hover:text-cream-50"
            >
              <PhoneIcon size={16} className="text-bloom-300" />
              {siteConfig.contact.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <PinIcon size={16} className="text-bloom-300" />
              {siteConfig.contact.address}
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
                    className="text-sm text-cream-100/85 transition-colors hover:text-cream-50"
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
                className="transition-colors hover:text-cream-50"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-cream-50"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href={siteConfig.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-cream-50"
            >
              <WhatsAppIcon size={16} />
            </a>
            <a
              href={siteConfig.links.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10 hover:text-cream-50"
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
      <div className="border-t border-white/10 bg-ink-900">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-[0.7rem] uppercase tracking-[0.18em] text-cream-100/50 md:flex-row">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </span>
          <span className="text-cream-100/40">
            Powered by{" "}
            <span className="text-cream-100/70">{siteConfig.poweredBy}</span>
          </span>
        </Container>
      </div>
    </footer>
  );
}
