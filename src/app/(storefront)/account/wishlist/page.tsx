import type { Metadata } from "next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountWishlist } from "@/components/account/AccountWishlist";

export const metadata: Metadata = { title: "Wishlist" };

/**
 * Wishlist is local-only (mobile spec §3.16) — no `AccountGuard` so guests
 * can view the items they saved before signing in. Logged-in users see the
 * standard account chrome; guests see the same layout but with a "Hello
 * there" header.
 */
export default function WishlistPage() {
  return (
    <AccountLayout
      title="Your wishlist"
      description="Saved on this device. Sign in to keep it across sessions."
    >
      <AccountWishlist />
    </AccountLayout>
  );
}
