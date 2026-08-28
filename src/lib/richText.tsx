import DOMPurify from "isomorphic-dompurify";

/**
 * Shared sanitize + render helpers for admin-authored rich text (legal pages and
 * product descriptions). Content is sanitized on the backend at save time; we
 * sanitize AGAIN here before injecting it as live DOM — defense in depth, since
 * this is the point where authored markup becomes real nodes.
 *
 * Allowed tags/attrs mirror the Tiptap editor's output and the backend
 * whitelist. Inline `style` is permitted but hard-filtered to ONLY the two
 * properties the toolbar can produce — `text-align` and `font-size` — so no
 * `url()`, `expression()`, `position`, etc. can ride along.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "mark",
  "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "span",
];

const STYLE_ALLOWED = /^(?:text-align\s*:\s*(?:left|right|center|justify)|font-size\s*:\s*\d+(?:\.\d+)?(?:px|em|rem|%))$/i;

let hookRegistered = false;

/** Strip every style declaration except the whitelisted text-align/font-size. */
function ensureStyleHook() {
  if (hookRegistered) return;
  hookRegistered = true;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as Element;
    if (!el.getAttribute || !el.hasAttribute?.("style")) return;
    const kept = el
      .getAttribute("style")!
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d && STYLE_ALLOWED.test(d));
    if (kept.length) el.setAttribute("style", kept.join("; "));
    else el.removeAttribute("style");
  });
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR: ["href", "target", "rel", "class", "data-color", "style"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
};

/** Sanitize authored rich-text HTML for safe injection via dangerouslySetInnerHTML. */
export function sanitizeRichHtml(html: string): string {
  ensureStyleHook();
  return DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
}

/**
 * True when a stored string is rich-text HTML (from the editor) rather than a
 * legacy plain-text description. Plain text authored before the WYSIWYG editor
 * has no tags and must keep rendering with preserved line breaks.
 */
export function looksLikeHtml(value: string | null | undefined): boolean {
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

/**
 * Flatten rich-text HTML to a single line of plain text — for SEO `<meta>`
 * descriptions and anywhere tags must not leak. Legacy plain text passes
 * through unchanged (minus whitespace collapsing). Pure string ops, so it is
 * safe to call on the server without a DOM.
 */
export function richTextToPlain(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<(?:br|\/p|\/h[1-6]|\/li|\/blockquote)\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#3?9;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
