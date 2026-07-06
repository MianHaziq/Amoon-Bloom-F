"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Drawer } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleMobileNav } from "@/store/slices/ui.slice";
import { useT } from "@/i18n/useT";
import { LocaleToggle } from "./LocaleToggle";
import { DeliverToPill } from "@/features/location/components/DeliverToPill";

export function MobileNav() {
  const dispatch = useAppDispatch();
  const { t } = useT();
  const open = useAppSelector((s) => s.ui.isMobileNavOpen);
  const user = useAppSelector((s) => s.auth.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER";
  const { groups: categoryGroups } = useCategories();

  // Close drawer on navigation
  useEffect(() => {
    if (!open) return;
    return () => {
      // intentionally empty — close handled by Drawer effect
    };
  }, [open]);

  const close = () => dispatch(toggleMobileNav(false));

  return (
    <Drawer
      open={open}
      onClose={close}
      side="left"
      title={t("shop.browse")}
      width="max-w-sm"
    >
      <div className="flex flex-col gap-6 px-6 py-4">
        {/* Standalone Shop link — direct to the full catalogue, above the
            category breakdown. */}
        <Link
          onClick={close}
          href={ROUTES.shop}
          className="flex items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 text-white transition-colors hover:bg-ink-800"
        >
          <span className="font-display text-lg font-semibold">
            {t("common.shop")}
          </span>
          <ChevronRight size={18} className="text-white/70 rtl:-scale-x-100" />
        </Link>

        {categoryGroups.map((group) => (
          <section key={group.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              {group.id === "shop" ? t("nav.categories") : group.label}
            </p>
            <ul className="mt-3 flex flex-col gap-1">
              {group.categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    onClick={close}
                    href={ROUTES.category(cat.slug)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-base text-ink-900 hover:bg-cream-50"
                  >
                    <span className="font-display text-lg">{cat.title}</span>
                    <ChevronRight size={16} className="text-ink-400 rtl:-scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-2 flex flex-col gap-1 border-t border-ink-100 pt-4">
          {isStaff ? (
            <Link
              onClick={close}
              href={ROUTES.admin}
              className="rounded-xl bg-ink-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
            >
              {t("nav.adminPanel")}
            </Link>
          ) : null}
          {[
            { href: ROUTES.shop, label: t("nav.shopEverything") },
            { href: "/about", label: t("nav.ourStory") },
            { href: "/contact", label: t("nav.contact") },
          ].map((link) => (
            <Link
              key={link.href}
              onClick={close}
              href={link.href}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-50"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Preferences — language + delivery region are otherwise header-only
            (hidden on mobile), so surface them here for phone users. */}
        <div className="mt-2 flex flex-col gap-3 border-t border-ink-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink-700">
              {t("common.language")}
            </span>
            <LocaleToggle />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink-700">
              {t("nav.deliverTo")}
            </span>
            <DeliverToPill compact />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-cream-100 p-4">
          <p className="font-display text-lg text-ink-900">{t("nav.memberSignIn")}</p>
          <p className="text-sm text-ink-500">
            {t("nav.memberBody")}
          </p>
          <div className="mt-1 flex gap-2">
            <Link
              onClick={close}
              href={ROUTES.login}
              className="flex-1 rounded-full bg-ink-900 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              {t("common.signIn")}
            </Link>
            <Link
              onClick={close}
              href={ROUTES.register}
              className="flex-1 rounded-full border border-ink-200 px-4 py-2.5 text-center text-sm font-medium text-ink-900"
            >
              {t("nav.join")}
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
