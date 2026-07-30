import type { ReactNode } from "react";
import { notFound } from "next/navigation";
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
import { LOCALES, activeRegionSlugs } from "@/features/location/routing";

/**
 * Storefront shell for the `/:region/:locale` segment. This is the AUTHORITATIVE
 * validation boundary for the URL: the edge proxy only shape-checks the prefix,
 * so an unknown region slug or bad locale is turned into a 404 here (against the
 * live active-regions list). The proxy has already injected the matching
 * `x-region-slug`/`x-locale` headers, so the server resolvers used throughout
 * the tree resolve to this same region/locale.
 */
export default async function StorefrontLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ region: string; locale: string }> }>) {
  const { region, locale: localeParam } = await params;
  if (!(LOCALES as string[]).includes(localeParam)) notFound();
  const regions = await getCachedRegions().catch(() => []);
  if (!activeRegionSlugs(regions).includes(region.toLowerCase())) notFound();

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
