"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadsApi, type UploadPath } from "@/features/uploads/api/uploads.api";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { Button } from "@/components/ui/Button";
import { ImageIcon, TrashIcon } from "@/components/icons";
import { ApiError } from "@/services/http";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  path?: UploadPath;
  label?: string;
  hint?: string;
  className?: string;
  /** Allow selecting/dropping several images at once. Uploads them all and
   *  reports the URLs via `onUploadMany`. */
  multiple?: boolean;
  /** Called with all uploaded URLs when `multiple` is set. */
  onUploadMany?: (urls: string[]) => void;
  /**
   * Tailwind sizing for the preview image. Pass a fixed aspect ratio so the
   * admin sees the image in the same shape the storefront renders it —
   * e.g. `aspect-square` for 1:1 (products/categories) or `aspect-video`
   * for 16:9 (banners). Defaults to a fixed-height letterbox.
   */
  previewClassName?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUpload({
  value,
  onChange,
  path = "uploads",
  label = "Image",
  hint,
  className,
  previewClassName = "h-44 w-full",
  multiple = false,
  onUploadMany,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadsApi.image(file, path),
    onSuccess: (url) => {
      onChange(url);
    },
    onError: (err) => {
      dispatch(
        pushToast({
          title: "Upload failed",
          description: err instanceof ApiError ? err.message : "Could not upload image.",
          variant: "error",
        })
      );
    },
  });

  // Multi-file: validate each, upload in parallel, report all URLs at once.
  const uploadManyMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const valid = files.filter(
        (f) => f.type.startsWith("image/") && f.size <= MAX_BYTES
      );
      const skipped = files.length - valid.length;
      const urls = await Promise.all(valid.map((f) => uploadsApi.image(f, path)));
      return { urls, skipped };
    },
    onSuccess: ({ urls, skipped }) => {
      if (urls.length > 0) onUploadMany?.(urls);
      if (skipped > 0) {
        dispatch(
          pushToast({
            title: "Some files skipped",
            description: `${skipped} file(s) weren’t images or were larger than 5 MB.`,
            variant: "warning",
          })
        );
      }
    },
    onError: (err) => {
      dispatch(
        pushToast({
          title: "Upload failed",
          description: err instanceof ApiError ? err.message : "Could not upload images.",
          variant: "error",
        })
      );
    },
  });

  const busy = uploadMutation.isPending || uploadManyMutation.isPending;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadManyMutation.mutate(Array.from(files));
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      dispatch(
        pushToast({
          title: "Invalid file",
          description: "Please choose an image file.",
          variant: "warning",
        })
      );
      return;
    }
    if (file.size > MAX_BYTES) {
      dispatch(
        pushToast({
          title: "Too large",
          description: "Images must be 5 MB or smaller.",
          variant: "warning",
        })
      );
      return;
    }
    uploadMutation.mutate(file);
  };

  return (
    <div className={className}>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-ink-700">{label}</label>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (multiple) handleFiles(e.dataTransfer.files);
          else handleFile(e.dataTransfer.files?.[0]);
        }}
        className={
          "relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors " +
          (dragOver ? "border-bloom-500 bg-bloom-50" : "border-ink-200 bg-cream-50")
        }
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Uploaded preview"
            className={"object-cover " + previewClassName}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <ImageIcon size={28} className="text-ink-400" />
            <p className="text-sm font-medium text-ink-700">
              {busy
                ? "Uploading…"
                : multiple
                  ? "Drop images here"
                  : "Drop an image here"}
            </p>
            <p className="text-xs text-ink-400">
              PNG, JPG, or WebP · up to 5 MB{multiple ? " each" : ""}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (multiple) handleFiles(e.target.files);
            else handleFile(e.target.files?.[0] ?? null);
            e.target.value = ""; // allow re-selecting the same file(s)
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-ink-400">{hint}</p>
        <div className="flex items-center gap-2">
          {value ? (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onChange(null)}
              leadingIcon={<TrashIcon size={14} />}
            >
              Remove
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => inputRef.current?.click()}
            isLoading={busy}
          >
            {value ? "Replace" : multiple ? "Choose files" : "Choose file"}
          </Button>
        </div>
      </div>
    </div>
  );
}
