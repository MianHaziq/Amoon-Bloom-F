"use client";

import Link from "next/link";
import { useAppSelector } from "@/store";
import { Container } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";

const navItems = [
  { href: ROUTES.shop, label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href={ROUTES.home}
          className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.login}
            className="hidden text-sm text-zinc-600 hover:text-zinc-950 sm:inline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.cart}
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-zinc-100 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Cart
            {itemCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950 px-1.5 text-xs font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </Container>
    </header>
  );
}
