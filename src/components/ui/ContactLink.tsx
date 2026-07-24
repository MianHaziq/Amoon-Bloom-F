import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Clickable contact links (email → mailto:, phone → tel:) styled in the brand
 * pink so they read as tappable, not plain text — the way large storefronts
 * surface contact details. Phone numbers are forced to render left-to-right and
 * bidi-isolated, so a leading "+" always sits at the FRONT even inside Arabic
 * (RTL) copy (otherwise "+971…" reorders to "971…+"). Both are server-safe (no
 * hooks), so they drop into the async legal pages and the footer alike.
 */

/** Default look: pink, underlined — for links embedded in prose/legal body text. */
const BASE_LINK =
  "font-medium text-bloom-700 underline decoration-bloom-300 underline-offset-2 transition-colors hover:text-bloom-800 hover:decoration-bloom-500";

export function EmailLink({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  return (
    <a
      href={`mailto:${email.trim()}`}
      dir="ltr"
      className={cn(BASE_LINK, "[unicode-bidi:isolate]", className)}
    >
      {email.trim()}
    </a>
  );
}

export function PhoneLink({
  phone,
  className,
}: {
  phone: string;
  className?: string;
}) {
  // tel: target keeps only digits and a leading + (strip spaces/dashes/parens).
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <a
      href={`tel:${tel}`}
      dir="ltr"
      className={cn(BASE_LINK, "inline-block [unicode-bidi:isolate]", className)}
    >
      {phone.trim()}
    </a>
  );
}

// Email, then international phone ("+" followed by digits with optional single
// separators). Phone is intentionally "+"-anchored so it never matches years,
// article numbers, prices, or opening-hours ranges in legal copy.
const EMAIL_SRC = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}";
const PHONE_SRC = "\\+\\d(?:[ \\-()]?\\d){6,}";
const CONTACT_RE = new RegExp(`(${EMAIL_SRC})|(${PHONE_SRC})`, "g");

/**
 * Wrap every email / international phone number found in a plain string in the
 * clickable pink links above, leaving all other text untouched. Used to
 * linkify localized legal/policy copy that embeds contacts inline. `linkClassName`
 * lets a dark surface (e.g. the footer) recolour the links.
 */
export function linkifyContacts(
  text: string,
  linkClassName?: string
): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  CONTACT_RE.lastIndex = 0;
  while ((match = CONTACT_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;
    if (token.includes("@")) {
      parts.push(<EmailLink key={key} email={token} className={linkClassName} />);
    } else {
      parts.push(<PhoneLink key={key} phone={token} className={linkClassName} />);
    }
    last = match.index + token.length;
  }
  if (parts.length === 0) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
