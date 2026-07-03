"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Loader";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/services/queryKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useT } from "@/i18n/useT";
import { ROUTES } from "@/constants/routes";
import { notificationsApi } from "../api/notifications.api";
import type { ApiNotification } from "../types";
import { relativeTime } from "../utils";

/**
 * Header notification bell + dropdown inbox. Shared by the storefront header
 * and the admin topbar (admins are users too, so they get the same inbox).
 * Polls the unread count while signed in; loads the recent list lazily when the
 * panel opens. Renders nothing for guests. No push registration — web only.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const { t, locale } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(),
    enabled: isAuthenticated,
    // Only poll while the panel is open; when closed the badge still refreshes
    // on window focus, so we avoid a background request every 60s per session.
    refetchInterval: open ? 60_000 : false,
    refetchOnWindowFocus: true,
  });

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list({ limit: 8 }),
    queryFn: () => notificationsApi.list({ limit: 8 }),
    enabled: isAuthenticated && open,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!isAuthenticated) return null;

  const unread = unreadQuery.data ?? 0;

  const onItemClick = (n: ApiNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    const link =
      (typeof n.data?.deeplink === "string" && n.data.deeplink) ||
      (typeof n.data?.link === "string" && n.data.link) ||
      null;
    setOpen(false);
    if (link && link.startsWith("/")) router.push(link);
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notifications.bell")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-all hover:bg-cream-100"
      >
        <BellIcon size={20} />
        {unread > 0 ? (
          <span className="absolute -inset-e-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bloom-500 px-1.5 text-xs font-semibold tabular-nums text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute inset-e-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-(--shadow-lift)"
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="font-display text-base font-medium text-ink-900">
              {t("notifications.title")}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-medium text-bloom-700 transition-colors hover:text-bloom-800 disabled:opacity-50"
              >
                {t("notifications.markAllRead")}
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {listQuery.isPending ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (listQuery.data?.items.length ?? 0) === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="font-display text-sm text-ink-700">
                  {t("notifications.empty")}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {t("notifications.emptyBody")}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-ink-50">
                {listQuery.data?.items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onItemClick(n)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-start transition-colors hover:bg-cream-50",
                        !n.readAt && "bg-blush-50/60"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {!n.readAt ? (
                          <span
                            aria-hidden
                            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-bloom-500"
                          />
                        ) : null}
                        <span className="line-clamp-1 text-sm font-medium text-ink-900">
                          {n.title}
                        </span>
                      </span>
                      <span className="line-clamp-2 text-xs text-ink-500">
                        {n.body}
                      </span>
                      <span className="text-[11px] text-ink-400">
                        {relativeTime(n.createdAt, locale)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={ROUTES.notifications}
            onClick={() => setOpen(false)}
            className="block border-t border-ink-100 px-4 py-3 text-center text-sm font-medium text-bloom-700 transition-colors hover:bg-cream-50"
          >
            {t("notifications.viewAll")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
