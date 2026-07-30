import type { Metadata } from "next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { AccountWishlist } from "@/components/account/AccountWishlist";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = { title: "Wishlist" };

/**
 * Wishlist is local-only (mobile spec §3.16) — no `AccountGuard` so guests
 * can view the items they saved before signing in. Logged-in users see the
 * standard account chrome; guests see the same layout but with a "Hello
 * there" header.
 */
export default async function WishlistPage() {
  const { t } = await getServerT();
  return (
    <AccountLayout
      title={t("account.wishlistTitle")}
      description={t("account.wishlistDesc")}
    >
      <AccountWishlist />
    </AccountLayout>
  );
}
