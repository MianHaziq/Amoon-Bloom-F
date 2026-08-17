import { notFound } from "next/navigation";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { getCachedLegalPage } from "@/services/catalogCache";
import { localized } from "@/i18n";
import type { LegalPageSlug } from "@/features/regions/types";

/** "August 2026" / "أغسطس 2026" from an ISO timestamp. */
function formatUpdated(iso: string, locale: "en" | "ar"): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Shared renderer for the 5 footer legal pages. Fetches the region's authored,
 * published page for `slug`; renders it as sanitized rich text — or 404s when
 * the region hasn't set it ("hidden until set"). `fallbackTitle` is used only
 * when the admin left the page title blank.
 */
export async function LegalPageRoute({
  slug,
  fallbackTitle,
}: {
  slug: LegalPageSlug;
  fallbackTitle: [string, string];
}) {
  const [locale, region] = await Promise.all([getServerLocale(), getServerRegion()]);
  const page = await getCachedLegalPage(region, slug).catch(() => null);
  if (!page) notFound();

  const content =
    (locale === "ar" ? page.content_ar?.trim() : undefined) || page.content?.trim() || "";
  if (!content) notFound();

  const title =
    (locale === "ar" ? page.title_ar?.trim() : undefined) ||
    page.title?.trim() ||
    localized(fallbackTitle[0], fallbackTitle[1], locale);

  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={title}
      badge={title}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={formatUpdated(page.updatedAt, locale)}
      html={content}
    />
  );
}
