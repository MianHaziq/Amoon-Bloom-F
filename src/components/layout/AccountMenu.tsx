"use client";

import { useRouter } from "next/navigation";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSeparator,
} from "@/components/ui";
import {
  UserIcon,
  PackageIcon,
  HeartIcon,
  BagIcon,
  LogoutIcon,
  LoginIcon,
  UserPlusIcon,
  ShieldIcon,
} from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { useAppSelector } from "@/store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";

/**
 * Storefront account menu — the far-right header control. Click (or keyboard)
 * opens an accessible dropdown that adapts to auth state: a full account menu
 * for signed-in shoppers, sign-in / register for guests. Built on the shared
 * <Menu> primitive so keyboard nav, focus management, ARIA, outside-click and
 * motion all come for free.
 */
export function AccountMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useT();
  const user = useAppSelector((s) => s.auth.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const initials = (() => {
    const f = user?.firstName?.[0] ?? user?.name?.[0] ?? "";
    const l = user?.lastName?.[0] ?? "";
    const combined = `${f}${l}`.trim();
    return combined ? combined.toUpperCase() : null;
  })();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    t("nav.myAccount");

  const handleLogout = () => {
    signOut();
    router.push(ROUTES.home);
  };

  return (
    <Menu className={className}>
      <MenuTrigger
        label={user ? t("nav.myAccount") : t("common.signIn")}
        className={cn(
          "group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-all duration-200",
          "hover:bg-ink-900 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
          "aria-expanded:bg-ink-900 aria-expanded:text-white"
        )}
      >
        {user && initials ? (
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-full bg-bloom-100 text-[11px] font-semibold text-bloom-700 transition-colors group-hover:bg-white/15 group-hover:text-white group-aria-expanded:bg-white/15 group-aria-expanded:text-white"
          >
            {initials}
          </span>
        ) : (
          <UserIcon size={20} />
        )}
      </MenuTrigger>

      <MenuContent align="end">
        {user ? (
          <>
            <MenuHeader title={displayName} subtitle={user.email} />
            <MenuSeparator />
            {/* Staff jump to the admin panel — always available here, on every
                screen size, so admins never lose their way back in. */}
            {isStaff ? (
              <>
                <MenuItem href={ROUTES.admin} icon={<ShieldIcon size={18} />}>
                  {t("nav.adminPanel")}
                </MenuItem>
                <MenuSeparator />
              </>
            ) : null}
            <MenuItem href={ROUTES.account} icon={<UserIcon size={18} />}>
              {t("nav.myAccount")}
            </MenuItem>
            <MenuItem href={ROUTES.orders} icon={<PackageIcon size={18} />}>
              {t("nav.myOrders")}
            </MenuItem>
            <MenuItem
              href={ROUTES.wishlist}
              icon={<HeartIcon size={18} />}
              trailing={
                wishlistCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-100 px-1.5 text-xs font-semibold tabular-nums text-ink-600">
                    {wishlistCount}
                  </span>
                ) : undefined
              }
            >
              {t("nav.wishlist")}
            </MenuItem>
            <MenuItem
              href={ROUTES.cart}
              icon={<BagIcon size={18} />}
              trailing={
                itemCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-100 px-1.5 text-xs font-semibold tabular-nums text-ink-600">
                    {itemCount}
                  </span>
                ) : undefined
              }
            >
              {t("nav.cart")}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onSelect={handleLogout}
              icon={<LogoutIcon size={18} />}
              tone="danger"
            >
              {t("account.signOut")}
            </MenuItem>
          </>
        ) : (
          <>
            <MenuHeader
              title={t("nav.memberSignIn")}
              subtitle={t("nav.memberBody")}
            />
            <MenuSeparator />
            <MenuItem href={ROUTES.login} icon={<LoginIcon size={18} />}>
              {t("nav.login")}
            </MenuItem>
            <MenuItem href={ROUTES.register} icon={<UserPlusIcon size={18} />}>
              {t("auth.createAccount")}
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}
