"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { BellIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/services/queryKeys";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import type { ApiNotification } from "@/features/notifications/types";
import { relativeTime } from "@/features/notifications/utils";
import { useT } from "@/i18n/useT";

const PAGE_SIZE = 20;

/**
 * Full notification inbox for /account/notifications. Paginates page-by-page
 * (not by growing `limit`, which would eventually exceed the backend's
 * limit<=100 cap and 400), marks a row read on click (and follows an in-app
 * deep-link if the payload carries one), and offers mark-all-read.
 */
export function AccountNotifications() {
  const { t, locale } = useT();
  const router = useRouter();
  const qc = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ limit: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  const onItemClick = (n: ApiNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    const link =
      (typeof n.data?.deeplink === "string" && n.data.deeplink) ||
      (typeof n.data?.link === "string" && n.data.link) ||
      null;
    if (link && link.startsWith("/")) router.push(link);
  };

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const unread = query.data?.pages[0]?.unreadCount ?? 0;

  if (query.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.isError && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-200 bg-cream-50 px-6 py-16 text-center">
        <p className="text-sm text-ink-500">{t("notifications.loadError")}</p>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-200 bg-cream-50 px-6 py-16 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
          <BellIcon size={28} />
        </span>
        <div>
          <h2 className="font-display text-2xl text-ink-900">
            {t("notifications.empty")}
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            {t("notifications.emptyBody")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {unread > 0 ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            isLoading={markAll.isPending}
          >
            {t("notifications.markAllRead")}
          </Button>
        </div>
      ) : null}

      <ul className="flex flex-col divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onItemClick(n)}
              className={cn(
                "flex w-full items-start gap-3 px-5 py-4 text-start transition-colors hover:bg-cream-50",
                !n.readAt && "bg-blush-50/60"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full",
                  n.readAt ? "bg-transparent" : "bg-bloom-500"
                )}
              />
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-ink-900">{n.title}</span>
                <span className="text-sm text-ink-600">{n.body}</span>
                <span className="mt-0.5 text-xs text-ink-400">
                  {relativeTime(n.createdAt, locale)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {query.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => query.fetchNextPage()}
            isLoading={query.isFetchingNextPage}
          >
            {t("common.loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
