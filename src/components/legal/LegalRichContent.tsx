import DOMPurify from "isomorphic-dompurify";

/**
 * Renders admin-authored legal-page HTML on the storefront. The HTML is already
 * sanitized on save (backend utils/sanitizeLegalHtml), but we sanitize AGAIN
 * here before injecting it — defense in depth, since this is the point where
 * untrusted-authored markup becomes live DOM. Allowed tags mirror the editor's
 * output + the backend whitelist. Styling comes from the `.legal-prose` class
 * (see globals.css).
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "mark",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "span",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "data-color"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
};

export function LegalRichContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
  return <div className="legal-prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}
