import Link from "next/link";
import { Container } from "@/components/ui";
import {
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/icons";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { NewsletterForm } from "./NewsletterForm";

const sections = [
  {
    title: "Shop",
    links: [
      { href: ROUTES.shop, label: "Everything" },
      { href: ROUTES.category("flowers"), label: "Flowers" },
      { href: ROUTES.category("cakes"), label: "Cakes & sweets" },
      { href: ROUTES.category("balloons"), label: "Balloons" },
      { href: ROUTES.category("gifts"), label: "Gifts & hampers" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Customer care" },
      { href: "/shipping", label: "Delivery" },
      { href: "/returns", label: "Returns" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/journal", label: "Journal" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press" },
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
            The Bloom letter
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
            Quietly considered
            <br />
            arrivals, in your inbox.
          </h2>
          <p className="mt-3 max-w-md text-sm text-cream-100/70">
            Seasonal launches, behind-the-scenes from the boutique, and a
            members-only edit each month.
          </p>
        </div>
        <NewsletterForm />
      </Container>

      {/* Link grid */}
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-medium tracking-tight">
            <span className="text-cream-50">Amoon</span>{" "}
            <span className="text-bloom-300">Bloom</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-cream-100/70">
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

      {/* Sub-footer */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-cream-100/60 md:flex-row">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cream-50">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cream-50">
              Terms
            </Link>
            <a
              href={siteConfig.links.instagram}
              className="inline-flex items-center gap-1.5 hover:text-cream-50"
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon size={14} />
              Instagram
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
