import { looksLikeHtml, sanitizeRichHtml } from "@/lib/richText";

/**
 * Renders a product description body on the storefront.
 *
 * New descriptions authored in the admin WYSIWYG editor are rich-text HTML and
 * render (sanitized) via the shared `.legal-prose` styling. Descriptions saved
 * before the editor existed are plain text with no tags — those keep rendering
 * exactly as before, with line breaks preserved. This keeps every already
 * published product looking identical while new ones gain formatting.
 */
export function ProductRichText({ text }: { text: string }) {
  if (looksLikeHtml(text)) {
    return (
      <div
        className="legal-prose text-base"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }}
      />
    );
  }
  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">{text}</p>
  );
}
