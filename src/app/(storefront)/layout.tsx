import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartPersistence } from "@/features/cart/components/CartPersistence";
import { CartSync } from "@/features/cart/components/CartSync";
import { WishlistPersistence } from "@/features/wishlist/components/WishlistPersistence";
import { LocationPersistence } from "@/features/location/components/LocationPersistence";
import { LocationOnboarding } from "@/features/location/components/LocationOnboarding";
import { AuthHydrator } from "@/features/auth/components/AuthHydrator";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";

export default async function StorefrontLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getServerLocale();
  return (
    <>
      <AuthHydrator />
      <CartPersistence />
      <CartSync />
      <WishlistPersistence />
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
      <CartDrawer />
    </>
  );
}
