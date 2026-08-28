import { sanitizeRichHtml } from "@/lib/richText";

/**
 * Renders admin-authored legal-page HTML on the storefront. The HTML is already
 * sanitized on save (backend utils/sanitizeLegalHtml), but we sanitize AGAIN
 * here before injecting it — defense in depth, since this is the point where
 * authored markup becomes live DOM. Styling comes from the `.legal-prose` class
 * (see globals.css).
 */
export function LegalRichContent({ html }: { html: string }) {
  const clean = sanitizeRichHtml(html ?? "");
  return <div className="legal-prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}
