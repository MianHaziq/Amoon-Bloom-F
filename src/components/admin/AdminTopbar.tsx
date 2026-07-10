"use client";

import Link from "next/link";
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
  ChevronDown,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  StoreIcon,
  UserIcon,
} from "@/components/icons";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAppSelector } from "@/store";
import { siteConfig } from "@/config/site";
import { useT } from "@/i18n/useT";

interface AdminTopbarProps {
  title?: string;
  onOpenMobileNav?: () => void;
}

export function AdminTopbar({ title, onOpenMobileNav }: AdminTopbarProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { t } = useT();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const initials = (() => {
    const f = user?.firstName?.[0] ?? user?.name?.[0] ?? "A";
    const l = user?.lastName?.[0] ?? "";
    return `${f}${l}`.toUpperCase();
  })();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    t("admin.admin");

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
        aria-label={t("nav.openMenu")}
      >
        <MenuIcon size={20} />
      </button>

      {/* Brand logo — visible on mobile where the sidebar (and its logo) is
          hidden, so the admin stays branded everywhere. */}
      <Link
        href="/admin"
        aria-label={`${siteConfig.name} — ${t("admin.admin")}`}
        className="flex shrink-0 items-center lg:hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt={siteConfig.name} className="h-7 w-auto" />
      </Link>

      <h1 className="hidden font-display text-xl text-ink-900 lg:block">
        {title ?? t("admin.admin")}
      </h1>

      <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
        <NotificationBell />
        <LocaleToggle className="hidden sm:inline-flex" />

        <Menu>
          <MenuTrigger
            label={t("admin.myProfile")}
            className="group flex items-center gap-2 rounded-full border border-ink-100 bg-white p-1 pe-2.5 text-sm transition-all duration-200 hover:border-ink-200 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 aria-expanded:border-ink-200 aria-expanded:bg-ink-50"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full bg-bloom-100 text-[11px] font-semibold text-bloom-700"
            >
              {initials}
            </span>
            <span className="hidden text-start sm:block">
              <span className="block text-xs font-semibold leading-tight text-ink-900">
                {user?.firstName || user?.name || t("admin.admin")}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-ink-400">
                {user?.role ?? t("admin.admin")}
              </span>
            </span>
            <ChevronDown
              size={16}
              className="hidden text-ink-400 transition-transform duration-200 group-aria-expanded:rotate-180 sm:block"
            />
          </MenuTrigger>

          <MenuContent align="end">
            <MenuHeader title={displayName} subtitle={user?.email} />
            <MenuSeparator />
            <MenuItem href="/account" icon={<UserIcon size={18} />}>
              {t("admin.myProfile")}
            </MenuItem>
            {isAdmin ? (
              <MenuItem href="/admin/settings" icon={<SettingsIcon size={18} />}>
                {t("admin.settings")}
              </MenuItem>
            ) : null}
            <MenuItem href="/" icon={<StoreIcon size={18} />}>
              {t("admin.backToStore")}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onSelect={handleLogout}
              icon={<LogoutIcon size={18} />}
              tone="danger"
            >
              {t("admin.signOut")}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
