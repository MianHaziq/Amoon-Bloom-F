"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Drawer } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { categoryGroups } from "@/features/categories/data/categories.mock";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleMobileNav } from "@/store/slices/ui.slice";

export function MobileNav() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.isMobileNavOpen);

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
      title="Browse"
      width="max-w-sm"
    >
      <div className="flex flex-col gap-6 px-6 py-4">
        {categoryGroups.map((group) => (
          <section key={group.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
              {group.label}
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
                    <ChevronRight size={16} className="text-ink-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-2 flex flex-col gap-1 border-t border-ink-100 pt-4">
          {[
            { href: ROUTES.shop, label: "Shop everything" },
            { href: "/about", label: "Our story" },
            { href: "/contact", label: "Contact" },
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

        <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-cream-100 p-4">
          <p className="font-display text-lg text-ink-900">Member sign in</p>
          <p className="text-sm text-ink-500">
            Track orders, save favourites, and reorder in one tap.
          </p>
          <div className="mt-1 flex gap-2">
            <Link
              onClick={close}
              href={ROUTES.login}
              className="flex-1 rounded-full bg-ink-900 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Sign in
            </Link>
            <Link
              onClick={close}
              href={ROUTES.register}
              className="flex-1 rounded-full border border-ink-200 px-4 py-2.5 text-center text-sm font-medium text-ink-900"
            >
              Join
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
