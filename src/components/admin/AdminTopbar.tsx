"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAppSelector } from "@/store";
import { LogoutIcon, MenuIcon, UserIcon } from "@/components/icons";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const initials = (() => {
    const f = user?.firstName?.[0] ?? user?.name?.[0] ?? "A";
    const l = user?.lastName?.[0] ?? "";
    return `${f}${l}`.toUpperCase();
  })();

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-md p-2 text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
        aria-label="Open admin navigation"
      >
        <MenuIcon size={20} />
      </button>

      <h1 className="font-display text-xl text-ink-900">
        {title ?? t("admin.admin")}
      </h1>

      <div className="ms-auto flex items-center gap-2" ref={menuRef}>
        <NotificationBell />
        <LocaleToggle className="hidden sm:inline-flex" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-ink-100 bg-white px-2 py-1 pe-3 text-sm transition-colors hover:bg-ink-50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bloom-100 text-[11px] font-semibold text-bloom-700">
            {initials}
          </span>
          <span className="hidden text-start sm:block">
            <span className="block text-xs font-medium leading-tight text-ink-900">
              {user?.firstName || user?.name || t("admin.admin")}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-ink-400">
              {user?.role ?? t("admin.admin")}
            </span>
          </span>
        </button>

        {open ? (
          <div className="absolute inset-e-4 top-14 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-(--shadow-lift) sm:inset-e-6">
            <div className="border-b border-ink-100 px-4 py-3">
              <p className="text-sm font-medium text-ink-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-ink-500">{user?.email}</p>
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ink-50"
            >
              <UserIcon size={16} />
              <span>{t("admin.myProfile")}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 border-t border-ink-100 px-4 py-2.5 text-start text-sm text-bloom-700 transition-colors hover:bg-bloom-50"
            >
              <LogoutIcon size={16} />
              <span>{t("admin.signOut")}</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
