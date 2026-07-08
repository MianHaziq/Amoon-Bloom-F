"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannersApi } from "@/features/banners/api/banners.api";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
import { isVideoUrl } from "@/features/banners/media";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableList, SortableItem } from "@/components/admin/Sortable";
import { TrashIcon, ImageIcon, GripVerticalIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { ApiError } from "@/services/http";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { cn } from "@/lib/cn";
import type { ApiBanner, BannerPlatform } from "@/features/banners/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export function BannersAdminPage() {
  const toast = useToast();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<ApiBanner | null>(null);
  // Which client the NEXT uploaded banner targets. Default MOBILE — the mobile app
  // shows image banners; WEB is opt-in for the website (and can be a video).
  const [platform, setPlatform] = useState<BannerPlatform>("MOBILE");
  // When the user reorders, we hold an override list locally. Otherwise we
  // render directly from the query — no effect-driven sync needed.
  const [override, setOverride] = useState<ApiBanner[] | null>(null);

  const query = useQuery({
    queryKey: queryKeys.banners.list(),
    queryFn: () => bannersApi.list(),
  });

  const order = override ?? query.data ?? [];
  const dirty = override !== null;

  const addMutation = useMutation({
    mutationFn: async (file: File) => {
      const isVideo = file.type.startsWith("video/");
      const url = isVideo
        ? await uploadsApi.video(file, "uploads")
        : await uploadsApi.image(file, "uploads");
      // Publish immediately so the banner appears on the storefront right away.
      return bannersApi.create({ url, platform, status: "PUBLISHED" });
    },
    onSuccess: () => {
      toast.success({ title: t("admin.bannersPage.toastAdded") });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      revalidateCatalog(["banners"]);
      setOverride(null);
    },
    onError: (err) => toast.fromError(t("admin.bannersPage.toastAddError"), err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.bannersPage.toastRemoved") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      revalidateCatalog(["banners"]);
      setOverride(null);
    },
    onError: (err) => toast.fromError(t("admin.bannersPage.toastRemoveError"), err),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => bannersApi.reorder(ids),
    onSuccess: () => {
      toast.success({ title: t("admin.bannersPage.toastOrderSaved") });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      revalidateCatalog(["banners"]);
      setOverride(null);
    },
    onError: (err) => toast.fromError(t("admin.bannersPage.toastOrderError"), err),
  });

  const isWeb = platform === "WEB";

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error({
        title: t("admin.bannersPage.fileTypeErrorTitle"),
        description: t("admin.bannersPage.fileTypeErrorDescription"),
      });
      return;
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      toast.error({
        title: t("admin.bannersPage.videoTooLargeTitle"),
        description: t("admin.bannersPage.videoTooLargeDescription"),
      });
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      toast.error({
        title: t("admin.bannersPage.imageTooLargeTitle"),
        description: t("admin.bannersPage.imageTooLargeDescription"),
      });
      return;
    }
    addMutation.mutate(file);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.bannersPage.title")}
        description={t("admin.bannersPage.description")}
        actions={
          dirty ? (
            <Button
              isLoading={reorderMutation.isPending}
              onClick={() => reorderMutation.mutate(order.map((b) => b.id))}
            >
              {t("admin.bannersPage.saveOrder")}
            </Button>
          ) : null
        }
      />

      <div className="mb-6 rounded-2xl border border-dashed border-ink-200 bg-cream-50 p-6 text-center">
        <ImageIcon size={28} className="mx-auto mb-3 text-ink-400" />

        {/* Platform selector: MOBILE (default) or WEB */}
        <div className="mb-4 flex justify-center">
          <div
            role="tablist"
            aria-label={t("admin.bannersPage.platformTabsAriaLabel")}
            className="inline-flex rounded-full border border-ink-200 bg-white p-1"
          >
            {(["MOBILE", "WEB"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={platform === p}
                onClick={() => setPlatform(p)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                  (platform === p
                    ? "bg-ink-900 text-white"
                    : "text-ink-600 hover:text-ink-900")
                }
              >
                {p === "MOBILE"
                  ? t("admin.bannersPage.platformMobile")
                  : t("admin.bannersPage.platformWeb")}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-3 text-sm text-ink-700">
          {addMutation.isPending
            ? t("admin.common.uploading")
            : isWeb
              ? t("admin.bannersPage.uploadPromptWeb")
              : t("admin.bannersPage.uploadPromptMobile")}
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          id="banner-upload"
          className="sr-only"
          disabled={addMutation.isPending}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <label
          htmlFor="banner-upload"
          className={
            "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-white " +
            (addMutation.isPending
              ? "pointer-events-none bg-ink-400"
              : "cursor-pointer bg-ink-900 hover:bg-ink-800")
          }
        >
          {addMutation.isPending
            ? t("admin.common.uploading")
            : t("admin.bannersPage.chooseFile")}
        </label>
        <p className="mt-2 text-xs text-ink-400">{t("admin.bannersPage.uploadHint")}</p>
      </div>

      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          {query.error instanceof ApiError
            ? query.error.message
            : t("admin.bannersPage.loadError")}
        </div>
      ) : order.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center">
          <p className="font-display text-lg text-ink-700">
            {t("admin.bannersPage.emptyTitle")}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {t("admin.bannersPage.emptyDescription")}
          </p>
        </div>
      ) : (
        <SortableList
          items={order}
          getId={(b) => b.id}
          onReorder={setOverride}
          strategy="grid"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(banner, i) => {
            const video = isVideoUrl(banner.url);
            const isWebBanner = banner.platform === "WEB";
            return (
              <SortableItem key={banner.id} id={banner.id}>
                {({ setNodeRef, style, isDragging, handleProps }) => (
                  <div
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-ink-100 bg-white",
                      isDragging && "shadow-(--shadow-lift)"
                    )}
                  >
                    {video ? (
                      <video
                        src={banner.url}
                        className="aspect-video w-full bg-ink-900 object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.url}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-ink-900/70 px-2 py-1 text-xs font-medium text-white">
                          #{i + 1}
                        </span>
                        <span
                          className={
                            "rounded-full px-2 py-1 text-xs font-medium text-white " +
                            (isWebBanner ? "bg-bloom-600/90" : "bg-ink-900/80")
                          }
                        >
                          {isWebBanner
                            ? t("admin.bannersPage.badgeWeb")
                            : t("admin.bannersPage.badgeMobile")}
                          {video ? t("admin.bannersPage.badgeVideoSuffix") : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...handleProps}
                          aria-label={t("admin.common.dragToReorder")}
                          className="touch-none rounded-full bg-white/90 p-2 text-ink-600 shadow-sm transition-colors hover:bg-white active:cursor-grabbing"
                          style={{ cursor: "grab" }}
                        >
                          <GripVerticalIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(banner)}
                          className="rounded-full bg-white/90 p-2 text-bloom-700 shadow-sm transition-colors hover:bg-white"
                          aria-label={t("admin.bannersPage.removeAriaLabel")}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </SortableItem>
            );
          }}
        </SortableList>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.bannersPage.deleteTitle")}
        description={t("admin.bannersPage.deleteDescription")}
        confirmLabel={t("admin.common.remove")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
