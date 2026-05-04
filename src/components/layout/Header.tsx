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
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  toggleCartDrawer,
  toggleMobileNav,
} from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";

export function Header() {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
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
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-20">
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
            className="flex items-center gap-2"
            aria-label={`${siteConfig.name} — home`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bloom-600 font-display text-sm font-medium text-white">
              A
            </span>
            <span className="font-display text-2xl font-medium tracking-tight text-ink-900">
              {siteConfig.name.split(" ")[0]}{" "}
              <span className="text-bloom-600">
                {siteConfig.name.split(" ")[1]}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <MegaMenu className="hidden lg:flex" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LocaleToggle className="hidden md:inline-flex" />
            <IconButton label="Search" variant="ghost">
              <SearchIcon size={20} />
            </IconButton>
            <IconButton
              label="Account"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              <Link
                href={ROUTES.login}
                aria-label="Sign in"
                className="flex h-full w-full items-center justify-center"
              >
                <UserIcon size={20} />
              </Link>
            </IconButton>
            <IconButton
              label="Wishlist"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              <HeartIcon size={20} />
            </IconButton>
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
      </header>
      <MobileNav />
    </>
  );
}
