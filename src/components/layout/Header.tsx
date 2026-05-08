"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, IconButton } from "@/components/ui";
import {
  SearchIcon,
  BagIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
} from "@/components/icons";
import { AnnouncementBar } from "./AnnouncementBar";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { LocaleToggle } from "./LocaleToggle";
import { DeliverToPill } from "@/features/location/components/DeliverToPill";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCartDrawer, toggleMobileNav } from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";

export function Header() {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const user = useAppSelector((s) => s.auth.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300 ease-out-soft",
          scrolled
            ? "border-b border-ink-100 bg-cream-50/95 backdrop-blur-md"
            : "bg-cream-50"
        )}
      >
        <AnnouncementBar />

        {/* Top utility row — search + utility nav (BloomingBox-inspired) */}
        <Container className="flex h-16 items-center gap-4 lg:h-20">
          {/* Mobile menu trigger */}
          <IconButton
            label="Open menu"
            variant="ghost"
            className="lg:hidden"
            onClick={() => dispatch(toggleMobileNav(true))}
          >
            <MenuIcon size={22} />
          </IconButton>

          {/* Logo */}
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center gap-2"
            aria-label={`${siteConfig.name} — home`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-bloom-500 font-display text-sm font-medium tracking-wide text-white shadow-(--shadow-soft)">
              A
            </span>
            <span className="font-display text-xl font-medium leading-none tracking-tight text-ink-900 sm:text-2xl">
              <span>Amoonis</span>{" "}
              <span className="text-bloom-600">Boutique</span>
            </span>
          </Link>

          {/* Search — prominent on the live site */}
          <form
            role="search"
            className="hidden flex-1 md:block"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="group flex h-11 items-center gap-3 rounded-full border border-ink-200 bg-white px-4 transition-all focus-within:border-bloom-400 focus-within:ring-4 focus-within:ring-bloom-100">
              <SearchIcon size={18} className="text-ink-400" />
              <input
                type="search"
                placeholder="Search gift boxes, flowers, occasions…"
                className="h-full flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                aria-label="Search the boutique"
              />
            </label>
          </form>

          {/* Account link (desktop) */}
          <nav className="hidden items-center gap-4 lg:flex">
            {user ? (
              <Link
                href={ROUTES.account}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700 transition-colors hover:text-ink-900"
              >
                {user.firstName ? `Hi, ${user.firstName}` : "My account"}
              </Link>
            ) : (
              <Link
                href={ROUTES.login}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700 transition-colors hover:text-ink-900"
              >
                Login
              </Link>
            )}
            {isStaff ? (
              <Link
                href={ROUTES.admin}
                className="inline-flex h-8 items-center rounded-full bg-ink-900 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink-800"
              >
                Admin panel
              </Link>
            ) : null}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <DeliverToPill className="hidden lg:inline-flex" />
            <LocaleToggle className="hidden md:inline-flex" />
            <IconButton
              label="Search"
              variant="ghost"
              className="md:hidden"
            >
              <SearchIcon size={20} />
            </IconButton>
            <IconButton
              label="Account"
              variant="ghost"
              className="hidden lg:hidden"
            >
              <Link
                href={user ? ROUTES.account : ROUTES.login}
                aria-label={user ? "My account" : "Sign in"}
                className="flex h-full w-full items-center justify-center"
              >
                <UserIcon size={20} />
              </Link>
            </IconButton>
            <Link
              href={ROUTES.wishlist}
              aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-all hover:bg-cream-100 sm:inline-flex"
            >
              <HeartIcon size={20} />
              {wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bloom-500 px-1.5 text-xs font-semibold tabular-nums text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => dispatch(toggleCartDrawer(true))}
              className="relative inline-flex h-10 items-center gap-2 rounded-full bg-ink-900 pl-3 pr-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
              aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            >
              <BagIcon size={18} />
              <span className="hidden sm:inline">Cart</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bloom-500 px-1.5 text-xs font-semibold tabular-nums text-white">
                {itemCount}
              </span>
            </button>
          </div>
        </Container>

        {/* Category nav (mega menu) */}
        <div className="hidden border-t border-ink-100 lg:block">
          <Container>
            <MegaMenu className="-mx-4" />
          </Container>
        </div>
      </header>
      <MobileNav />
    </>
  );
}
