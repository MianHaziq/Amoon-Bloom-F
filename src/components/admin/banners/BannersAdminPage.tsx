"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannersApi } from "@/features/banners/api/banners.api";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TrashIcon, ChevronDown, ChevronRight, ImageIcon } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/http";
import type { ApiBanner } from "@/features/banners/types";

const MAX_BYTES = 5 * 1024 * 1024;

export function BannersAdminPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<ApiBanner | null>(null);
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
      const url = await uploadsApi.image(file, "uploads");
      return bannersApi.create({ url });
    },
    onSuccess: () => {
      toast.success({ title: "Banner added" });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      setOverride(null);
    },
    onError: (err) => toast.fromError("Could not add banner", err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Banner removed" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      setOverride(null);
    },
    onError: (err) => toast.fromError("Could not remove banner", err),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => bannersApi.reorder(ids),
    onSuccess: () => {
      toast.success({ title: "Order saved" });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      setOverride(null);
    },
    onError: (err) => toast.fromError("Could not save order", err),
  });

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOverride(next);
    
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error({ title: "Image only", description: "Please choose an image file." });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error({ title: "Too large", description: "Up to 5 MB." });
      return;
    }
    addMutation.mutate(file);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Homepage banners"
        description="Hero carousel images. Drag to reorder; the first image is shown first."
        actions={
          dirty ? (
            <Button
              isLoading={reorderMutation.isPending}
              onClick={() => reorderMutation.mutate(order.map((b) => b.id))}
            >
              Save order
            </Button>
          ) : null
        }
      />

      <div className="mb-6 rounded-2xl border border-dashed border-ink-200 bg-cream-50 p-6 text-center">
        <ImageIcon size={28} className="mx-auto mb-2 text-ink-400" />
        <p className="mb-3 text-sm text-ink-700">
          {addMutation.isPending ? "Uploading…" : "Add a new banner image"}
        </p>
        <input
          type="file"
          accept="image/*"
          id="banner-upload"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label
          htmlFor="banner-upload"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-ink-900 px-5 text-sm font-medium text-white hover:bg-ink-800"
        >
          {addMutation.isPending ? "Uploading…" : "Choose image"}
        </label>
        <p className="mt-2 text-xs text-ink-400">PNG, JPG, or WebP · up to 5 MB</p>
      </div>

      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          {query.error instanceof ApiError
            ? query.error.message
            : "Could not load banners."}
        </div>
      ) : order.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center">
          <p className="font-display text-lg text-ink-700">No banners yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Add your first banner above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {order.map((banner, i) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.url}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
                <span className="rounded-full bg-ink-900/70 px-2 py-1 text-xs font-medium text-white">
                  #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingDelete(banner)}
                  className="rounded-full bg-white/90 p-2 text-bloom-700 shadow-sm transition-colors hover:bg-white"
                  aria-label="Remove banner"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 p-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronRight size={14} className="-rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove banner?"
        description="This deletes the banner image immediately."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
