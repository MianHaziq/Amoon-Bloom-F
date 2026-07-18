"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container, IconButton } from "@/components/ui";
import {
  SearchIcon,
  BagIcon,
  HeartIcon,
  MenuIcon,
  ChevronDown,
} from "@/components/icons";
import { AnnouncementBar } from "./AnnouncementBar";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { HeaderSearch } from "./HeaderSearch";
import { MobileSearchOverlay } from "./MobileSearchOverlay";
import { LocaleToggle } from "./LocaleToggle";
import { AccountMenu } from "./AccountMenu";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { DeliverToPill } from "@/features/location/components/DeliverToPill";
import { LocationSheet } from "@/features/location/components/LocationSheet";
import { RegionFlag } from "@/features/location/components/RegionFlag";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { ROUTES } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCartDrawer, toggleMobileNav } from "@/store/slices/ui.slice";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";

export function Header() {
  const dispatch = useAppDispatch();
  const { t, tc } = useT();
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const user = useAppSelector((s) => s.auth.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";
  const country = useAppSelector((s) => s.location.country);
  const city = useAppSelector((s) => s.location.city);
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    staleTime: 5 * 60_000,
  });
  const currentRegion = regionsQuery.data?.find((r) => r.code === country);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const REVEAL_ZONE = 96;
    const HIDE_AFTER = 28;
    const SHOW_AFTER = 8;

    let lastY = window.scrollY;
    let dir: "up" | "down" | null = null;
    let travel = 0;
    let ticking = false;

    const evaluate = () => {
      const y = window.scrollY;
      setScrolled(y > 8);

      const delta = y - lastY;
      if (delta !== 0) {
        const newDir = delta > 0 ? "down" : "up";
        travel = newDir === dir ? travel + Math.abs(delta) : Math.abs(delta);
        dir = newDir;
      }

      if (y <= REVEAL_ZONE) setHidden(false);
      else if (dir === "down" && travel > HIDE_AFTER) setHidden(true);
      else if (dir === "up" && travel > SHOW_AFTER) setHidden(false);

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartLabel = `${t("nav.cart")}, ${tc(itemCount, "units.itemOne", "units.itemOther")}`;
  const wishlistLabel = `${t("nav.wishlist")}, ${tc(wishlistCount, "units.itemOne", "units.itemOther")}`;

  const cartBadge = itemCount > 0 && (
    <span className="absolute -right-0.5 -top-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-bloom-500 px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-cream-50">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transform-gpu will-change-transform transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out-soft",
          hidden ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "border-b border-ink-100 bg-cream-50/95 shadow-(--shadow-soft) backdrop-blur-md"
            : "border-b border-transparent bg-cream-50"
        )}
      >
        {/* Announcement bar — desktop only */}
        <div className="hidden md:block">
          <AnnouncementBar />
        </div>

        {/* ── Mobile header (< lg): two rows ── */}
        <div className="lg:hidden">
          {/* Row 1: Logo + delivery location */}
          <Container className="flex h-14 items-center justify-between">
            <Link
              href={ROUTES.home}
              className="flex shrink-0 items-center"
              aria-label={`${siteConfig.name} — home`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt={siteConfig.name} className="h-7 w-auto" />
            </Link>

            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors active:bg-ink-50"
              aria-label={`${t("nav.deliverTo")} ${city}`}
            >
              <div className="text-end">
                <p className="text-[10px] font-medium text-ink-400">
                  {t("nav.deliverTo")}
                </p>
                <p className="flex items-center justify-end gap-1 text-sm font-semibold text-bloom-700">
                  {city}
                  <ChevronDown size={12} />
                </p>
              </div>
              <RegionFlag
                region={currentRegion}
                shape="circle"
                className="h-9 w-9 shadow-sm ring-2 ring-ink-100"
              />
            </button>
          </Container>

          {/* Row 2: Hamburger + icon cluster */}
          <div className="border-t border-ink-100">
            <Container className="flex h-12 items-center justify-between">
              <IconButton
                label={t("nav.openMenu")}
                variant="ghost"
                onClick={() => dispatch(toggleMobileNav(true))}
              >
                <MenuIcon size={22} />
              </IconButton>

              <div className="flex items-center gap-0.5">
                <IconButton
                  label={t("common.search")}
                  variant="ghost"
                  onClick={() => setSearchOpen(true)}
                >
                  <SearchIcon size={20} />
                </IconButton>

                <button
                  type="button"
                  onClick={() => dispatch(toggleCartDrawer(true))}
                  className={cn(
                    "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
                    itemCount > 0
                      ? "bg-ink-900 text-white hover:bg-ink-800"
                      : "text-ink-700 hover:bg-ink-900 hover:text-white"
                  )}
                  aria-label={cartLabel}
                >
                  <BagIcon size={20} />
                  {cartBadge}
                </button>

                <AccountMenu />
              </div>
            </Container>
          </div>
        </div>

        {/* ── Desktop header (lg+): single row ── */}
        <Container className="hidden h-20 items-center gap-4 lg:flex">
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center"
            aria-label={`${siteConfig.name} — home`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt={siteConfig.name} className="h-9 w-auto" />
          </Link>

          <HeaderSearch />

          {isStaff ? (
            <nav className="flex items-center">
              <Link
                href={ROUTES.admin}
                className="inline-flex h-8 items-center rounded-full bg-ink-900 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink-800"
              >
                {t("nav.adminPanel")}
              </Link>
            </nav>
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            <DeliverToPill />
            <LocaleToggle className="me-1" />
            <NotificationBell />
            <Link
              href={ROUTES.wishlist}
              aria-label={wishlistLabel}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-all duration-200 hover:bg-ink-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              <HeartIcon size={20} />
              {wishlistCount > 0 ? (
                <span className="absolute -inset-e-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bloom-500 px-1.5 text-xs font-semibold tabular-nums text-white ring-2 ring-cream-50">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => dispatch(toggleCartDrawer(true))}
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
                itemCount > 0
                  ? "bg-ink-900 text-white hover:bg-ink-800"
                  : "text-ink-700 hover:bg-ink-900 hover:text-white"
              )}
              aria-label={cartLabel}
            >
              <BagIcon size={20} />
              {cartBadge}
            </button>
            <AccountMenu />
          </div>
        </Container>

        {/* Category nav — desktop only */}
        <div className="hidden border-t border-ink-100 lg:block">
          <Container>
            <MegaMenu className="-mx-4" />
          </Container>
        </div>
      </header>

      <MobileNav />
      {/* Mobile search — triggered by the row 2 search icon */}
      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Mobile location picker — triggered by row 1 button */}
      <LocationSheet open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
