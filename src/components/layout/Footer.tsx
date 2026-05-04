import Link from "next/link";
import { Container } from "@/components/ui";
import { siteConfig } from "@/config/site";

const sections = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/new", label: "New arrivals" },
      { href: "/shop/sale", label: "Sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/support", label: "Customer support" },
      { href: "/shipping", label: "Shipping & returns" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <Container className="grid gap-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {siteConfig.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {siteConfig.description}
          </p>
        </div>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {section.title}
            </p>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </span>
        <span>Crafted with care.</span>
      </Container>
    </footer>
  );
}
