import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartPersistence } from "@/features/cart/components/CartPersistence";
import { CartSync } from "@/features/cart/components/CartSync";
import { WishlistPersistence } from "@/features/wishlist/components/WishlistPersistence";
import { LocationPersistence } from "@/features/location/components/LocationPersistence";
import { RegionLocaleSync } from "@/features/location/components/RegionLocaleSync";
import { LocationOnboarding } from "@/features/location/components/LocationOnboarding";
import { AuthHydrator } from "@/features/auth/components/AuthHydrator";
import { ScrollManager } from "@/components/layout/ScrollManager";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";
import { getCachedRegions } from "@/services/catalogCache";
import { LOCALES, activeRegionSlugs, buildPrefix, regionSlug } from "@/features/location/routing";

/**
 * Storefront shell for the `/:region/:locale` segment. This is the AUTHORITATIVE
 * validation boundary for the URL: the edge proxy only shape-checks the prefix,
 * so a bad locale is turned into a 404 here, and a region slug that isn't active
 * (validated against the live active-regions list) is bounced to an open region.
 * The proxy has already injected the matching `x-region-slug`/`x-locale` headers,
 * so the server resolvers used throughout the tree resolve to this region/locale.
 */
export default async function StorefrontLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ region: string; locale: string }> }>) {
  const { region, locale: localeParam } = await params;
  if (!(LOCALES as string[]).includes(localeParam)) notFound();
  const regions = await getCachedRegions().catch(() => []);
  // `GET /regions` (public) already returns ONLY active regions, so any slug that
  // isn't in this list is either hidden-by-admin or unknown.
  if (!activeRegionSlugs(regions).includes(region.toLowerCase())) {
    // Don't 404 when other regions are OPEN — that strands every visitor whose
    // default/last-used region has been hidden (the edge proxy sends a bare "/"
    // to the hardcoded default slug "ae"; if that's hidden, the old code 404'd
    // even though another region was live). Bounce to the best available active
    // region instead: the one flagged default, else the first by sortOrder. The
    // target is guaranteed active (drawn from this same list), so it can't loop,
    // and the proxy re-syncs the region_slug cookie on the redirect, so a later
    // bare-path visit lands here directly. Only a store with ZERO open regions 404s.
    const fallback = regions.find((r) => r.isDefault) ?? regions[0];
    if (fallback) redirect(buildPrefix(regionSlug(fallback), localeParam));
    notFound();
  }

  const locale = await getServerLocale();
  return (
    <>
      <ScrollManager />
      <AuthHydrator />
      <CartPersistence />
      <CartSync />
      <WishlistPersistence />
      <RegionLocaleSync />
      <LocationPersistence />
      <LocationOnboarding />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t(locale, "a11y.skipToContent")}
      </a>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
      <WhatsAppFloatButton />
      <CartDrawer />
    </>
  );
}
