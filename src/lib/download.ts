/**
 * Pulls the filename out of a `Content-Disposition: attachment; filename="…"`
 * response header (the backend export routes set this). Falls back to a
 * generic name if the header is missing/unparsable — the export still
 * downloads, just without the server's exact name.
 */
export function filenameFromContentDisposition(
  contentDisposition: string | undefined,
  fallback: string
): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] || fallback;
}

/**
 * Triggers a browser download for an already-fetched Blob (e.g. an Excel/PDF
 * export response with `responseType: "blob"`). No such capability existed
 * anywhere in the frontend before the Order/Analytics export feature.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Safari can abort a same-tick download if the blob URL is revoked before
  // it has finished reading it, so defer the revoke to the next tick.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
