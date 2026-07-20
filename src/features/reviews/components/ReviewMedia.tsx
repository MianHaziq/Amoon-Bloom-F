"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { ChevronLeft, ChevronRight, CloseIcon, PlusIcon } from "@/components/icons";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useT } from "@/i18n/useT";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { reviewsApi } from "../api/reviews.api";

// Review media is images today, but the viewer also handles a video URL so the
// feature can extend to clips without another rewrite. Detect by extension.
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
export const isVideoUrl = (url: string) => VIDEO_RE.test(url);

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

/**
 * Read-only review media strip: a responsive row of square thumbnails that opens
 * a full-screen lightbox (swipe/keyboard nav, RTL-aware). Rendered under a review
 * comment on the storefront and in the admin moderation table.
 */
export function ReviewMedia({
  urls,
  className,
  thumbClassName,
}: {
  urls: string[] | undefined;
  className?: string;
  thumbClassName?: string;
}) {
  const { t, dir } = useT();
  const mounted = useIsHydrated();
  const [index, setIndex] = useState<number | null>(null);
  const list = urls ?? [];
  const count = list.length;
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + count) % count)),
    [count]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(dir === "rtl" ? -1 : 1);
      else if (e.key === "ArrowLeft") go(dir === "rtl" ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go, dir]);

  if (count === 0) return null;

  return (
    <>
      <ul className={cn("mt-3 flex flex-wrap gap-2", className)}>
        {list.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("product.reviewViewMedia", { n: i + 1 })}
              className={cn(
                "relative block h-16 w-16 overflow-hidden rounded-lg ring-1 ring-ink-200 transition hover:ring-bloom-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500 sm:h-20 sm:w-20",
                thumbClassName
              )}
            >
              {isVideoUrl(url) ? (
                <>
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <PlayBadge />
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && index !== null && (
              <m.div
                className="fixed inset-0 z-[130] flex items-center justify-center bg-ink-900/90 p-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                onClick={close}
                role="dialog"
                aria-modal="true"
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("common.close")}
                  className="absolute inset-e-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <CloseIcon size={20} />
                </button>

                {count > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(dir === "rtl" ? 1 : -1);
                      }}
                      aria-label={t("product.previousImage")}
                      className="absolute inset-s-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <ChevronLeft size={22} className="rtl:-scale-x-100" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(dir === "rtl" ? -1 : 1);
                      }}
                      aria-label={t("product.nextImage")}
                      className="absolute inset-e-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <ChevronRight size={22} className="rtl:-scale-x-100" />
                    </button>
                  </>
                )}

                <m.div
                  key={list[index]}
                  className="relative flex max-h-[85vh] max-w-[92vw] items-center justify-center"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isVideoUrl(list[index]) ? (
                    <video
                      src={list[index]}
                      controls
                      autoPlay
                      className="max-h-[85vh] max-w-[92vw] rounded-lg"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={list[index]}
                      alt=""
                      className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
                    />
                  )}
                  {count > 1 && (
                    <span className="absolute inset-x-0 -bottom-7 text-center text-sm text-white/80">
                      {index + 1} / {count}
                    </span>
                  )}
                </m.div>
              </m.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Media input for the review form: pick several photos, each uploaded straight to
 * the CDN (public `reviews/media` endpoint) with live preview + remove. Reports
 * the resulting URLs via `onChange` and its in-flight state via `onUploadingChange`
 * so the form can block submit until uploads finish.
 */
export function ReviewMediaPicker({
  value,
  onChange,
  max = 6,
  disabled,
  onUploadingChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0);
  }, [uploadingCount, onUploadingChange]);

  const remaining = max - value.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = max - value.length;
    if (room <= 0) {
      dispatch(pushToast({ title: t("product.reviewMediaMax", { max }), variant: "warning" }));
      return;
    }
    const toUpload: File[] = [];
    let skipped = 0;
    for (const f of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type) || f.size > MAX_BYTES || toUpload.length >= room) {
        skipped++;
        continue;
      }
      toUpload.push(f);
    }
    if (skipped > 0) {
      dispatch(pushToast({ title: t("product.reviewMediaSkipped", { count: skipped }), variant: "warning" }));
    }
    if (toUpload.length === 0) return;

    setUploadingCount((c) => c + toUpload.length);
    const results = await Promise.allSettled(toUpload.map((f) => reviewsApi.uploadMedia(f)));
    setUploadingCount((c) => Math.max(0, c - toUpload.length));

    const uploaded: string[] = [];
    let failed = 0;
    for (const r of results) {
      if (r.status === "fulfilled") uploaded.push(r.value);
      else failed++;
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded].slice(0, max));
    if (failed > 0) {
      dispatch(pushToast({ title: t("product.reviewMediaUploadError"), variant: "error" }));
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-900">
        {t("product.reviewAddPhotos")}
      </label>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div
            key={url}
            className="relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-ink-200 sm:h-20 sm:w-20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={t("common.remove")}
              className="absolute inset-e-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900/70 text-white transition hover:bg-ink-900"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="flex h-16 w-16 items-center justify-center rounded-lg bg-cream-100 ring-1 ring-ink-200 sm:h-20 sm:w-20"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-bloom-500" />
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink-300 text-ink-400 transition hover:border-bloom-400 hover:text-bloom-600 disabled:opacity-50 sm:h-20 sm:w-20"
          >
            <PlusIcon size={18} />
            <span className="text-[10px] leading-none">{t("product.reviewAddPhoto")}</span>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-ink-400">{t("product.reviewMediaHint", { max })}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
