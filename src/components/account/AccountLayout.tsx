"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Container } from "@/components/ui";
import {
  DocumentIcon,
  HeartIcon,
  LogoutIcon,
  PinIcon,
  UserIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n";
import type { ReactNode } from "react";

const NAV: {
  href: string;
  labelKey: MessageKey;
  icon: typeof UserIcon;
  exact?: boolean;
}[] = [
  { href: "/account", labelKey: "account.profile", icon: UserIcon, exact: true },
  { href: "/account/orders", labelKey: "account.orders", icon: DocumentIcon },
  { href: "/account/addresses", labelKey: "account.addresses", icon: PinIcon },
  { href: "/account/wishlist", labelKey: "account.wishlist", icon: HeartIcon },
];

export function AccountLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useAppSelector((s) => s.auth.user);
  const { t } = useT();

  const handleLogout = () => {
    signOut();
    router.replace("/");
  };

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
          {t("account.title")}
        </p>
        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">
          {title ??
            t("account.greeting", {
              name: user?.firstName ?? t("account.greetingThere"),
            })}
        </h1>
        {description ? <p className="mt-1 text-ink-500">{description}</p> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-bloom-50 text-bloom-700"
                    : "text-ink-600 hover:bg-cream-100 hover:text-ink-900"
                )}
              >
                <Icon size={16} />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-bloom-700 transition-colors hover:bg-bloom-50"
          >
            <LogoutIcon size={16} />
            {t("account.signOut")}
          </button>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </Container>
  );
}
