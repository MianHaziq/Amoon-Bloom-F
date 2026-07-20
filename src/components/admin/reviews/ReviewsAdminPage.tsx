"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { StarRatingDisplay } from "@/features/reviews/components/StarRatingDisplay";
import { ReviewMedia } from "@/features/reviews/components/ReviewMedia";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchIcon, TrashIcon } from "@/components/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/format";
import { useT } from "@/i18n/useT";
import type { ApiReview } from "@/features/reviews/types";

const PAGE_SIZE = 20;

export function ReviewsAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const debounced = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState<ApiReview | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(debounced ? { search: debounced } : {}),
    ...(rating ? { rating: Number(rating) } : {}),
  };

  const query = useQuery({
    queryKey: queryKeys.reviews.adminList(params),
    queryFn: () => reviewsApi.adminList(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.adminRemove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.reviewsPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
    onError: (err) => toast.fromError(t("admin.reviewsPage.toastDeleteError"), err),
  });

  const columns: Column<ApiReview>[] = [
    {
      key: "product",
      header: t("admin.reviewsPage.columnProduct"),
      cell: (r) => (
        <span className="text-sm font-medium text-ink-900">{r.product?.title ?? "—"}</span>
      ),
    },
    {
      key: "reviewer",
      header: t("admin.reviewsPage.columnReviewer"),
      cell: (r) => (
        <div>
          <p className="text-sm text-ink-900">{r.reviewerName}</p>
          {r.isGuest && (
            <Badge tone="neutral" className="mt-1">
              {t("admin.reviewsPage.guestBadge")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      header: t("admin.reviewsPage.columnRating"),
      cell: (r) => <StarRatingDisplay rating={r.rating} size={14} />,
    },
    {
      key: "comment",
      header: t("admin.reviewsPage.columnComment"),
      cell: (r) => (
        <div className="max-w-sm">
          <p className="truncate text-sm text-ink-600" title={r.comment}>
            {r.comment}
          </p>
          {r.media && r.media.length > 0 && (
            <ReviewMedia
              urls={r.media}
              className="mt-2"
              thumbClassName="h-10 w-10 sm:h-10 sm:w-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: t("admin.reviewsPage.columnDate"),
      cell: (r) => <span className="text-xs text-ink-500">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "80px",
      cell: (r) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setPendingDelete(r)}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
            aria-label={t("common.delete")}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.reviewsPage.title")}
        description={t("admin.reviewsPage.description")}
      />

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(r) => r.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        toolbar={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 sm:max-w-sm">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder={t("admin.reviewsPage.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none"
            >
              <option value="">{t("admin.reviewsPage.allRatingsOption")}</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
        }
        footer={
          <Pagination meta={query.data?.meta?.pagination} page={page} onChange={setPage} />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.reviewsPage.deleteTitle")}
        description={t("admin.reviewsPage.deleteDescription")}
        confirmLabel={t("common.delete")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
