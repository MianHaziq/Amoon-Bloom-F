"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { adminNav, filterNavForUser } from "./nav";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  const groups = useMemo(
    () => filterNavForUser(adminNav, user?.role, user?.managerPermissions),
    [user?.role, user?.managerPermissions]
  );

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-ink-100 bg-cream-50",
        className
      )}
      aria-label="Admin navigation"
    >
      <div className="flex h-16 items-center gap-2 border-b border-ink-100 px-6">
        <span className="font-display text-lg tracking-tight text-ink-900">
          {siteConfig.name}
        </span>
        <span className="rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-bloom-700">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5 last:mb-0">
            {group.label ? (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                {group.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-bloom-50 text-bloom-700"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                      )}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 px-6 py-4 text-xs text-ink-400">
        <Link
          href="/"
          className="text-ink-500 transition-colors hover:text-ink-900"
        >
          ← Back to storefront
        </Link>
      </div>
    </aside>
  );
}
