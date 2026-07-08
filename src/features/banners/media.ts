import type { BannerMediaKind } from "./types";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".ogv"];

/**
 * Detect whether a banner URL points to a video, so the storefront/admin can pick
 * the right element (<video> vs <img>). We key off the file extension — Bunny CDN
 * URLs always carry one — and ignore any query string.
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function bannerMediaKind(url: string | null | undefined): BannerMediaKind {
  return isVideoUrl(url) ? "video" : "image";
}
