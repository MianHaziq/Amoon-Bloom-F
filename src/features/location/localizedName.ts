import type { Locale } from "@/store/slices/ui.slice";

/**
 * Bilingual display name for any admin-managed record following the
 * `name` / `name_ar` convention (regions, delivery zones, branches…).
 *
 * DISPLAY ONLY — never use the result as an identity or a stored value.
 * `location.city`, the zone cookie and the addresses API all key off the
 * English `name`, so localizing a value that gets saved or compared would
 * silently break zone matching for Arabic visitors.
 *
 * A blank or whitespace-only `name_ar` counts as "not translated", so a row
 * never renders empty when the admin saved an empty Arabic field.
 */
export function localizedName(
  entity: { name: string; name_ar?: string | null } | undefined,
  locale: Locale
): string {
  if (!entity) return "";
  return (locale === "ar" ? entity.name_ar?.trim() : undefined) || entity.name;
}
