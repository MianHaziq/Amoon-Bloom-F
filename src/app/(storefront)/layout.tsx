import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartPersistence } from "@/features/cart/components/CartPersistence";
import { WishlistPersistence } from "@/features/wishlist/components/WishlistPersistence";
import { LocationPersistence } from "@/features/location/components/LocationPersistence";
import { AuthHydrator } from "@/features/auth/components/AuthHydrator";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AuthHydrator />
      <CartPersistence />
      <WishlistPersistence />
      <LocationPersistence />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
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
