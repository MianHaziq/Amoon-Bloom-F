/**
 * Per-section display configuration — the single source of truth shared by the
 * storefront renderer (SectionProducts), the admin form (SectionForm), and the
 * admin live preview. Keeping the defaults, bounds, and selectable column options
 * here means the backend clamp (section.service.js), the admin selects, and the
 * storefront render can never silently disagree.
 */

import type { ApiSection, SectionDisplay, SectionLayout } from "./types";

export const SECTION_LAYOUTS: readonly SectionLayout[] = ["SCROLL", "GRID"];

/** Selectable products-per-row (grid) / cards-visible (scroll) per breakpoint.
 *  Mirrors the express-validator bounds in section.routes.js. */
export const SECTION_COLUMN_OPTIONS = {
  desktop: [2, 3, 4, 5, 6],
  mobile: [1, 2, 3, 4],
} as const;

/** Selectable "show first N products" caps per breakpoint. Mirrors the
 *  express-validator bounds (desktop ≤24, mobile ≤12) in section.routes.js. */
export const SECTION_LIMIT_OPTIONS = {
  desktop: [4, 6, 8, 10, 12, 16, 20, 24],
  mobile: [2, 4, 6, 8, 10, 12],
} as const;

/** Largest number of product cards the storefront ever puts in a section's DOM —
 *  the max of the two per-breakpoint limits it must be able to satisfy. Equals the
 *  highest selectable desktop limit; kept in sync with the backend dynamic-fill cap
 *  (HOME_SECTION_DYNAMIC_CAP in section.service.js). */
export const SECTION_MAX_RENDER = 24;

/** Defaults reproduce the historical horizontal rail (and its 12-item cap) so an
 *  un-configured section looks exactly as it did before this feature existed. */
export const SECTION_DISPLAY_DEFAULTS: SectionDisplay = {
  desktopLayout: "SCROLL",
  desktopColumns: 4,
  desktopLimit: 12,
  mobileLayout: "SCROLL",
  mobileColumns: 2,
  mobileLimit: 12,
};

const LIMIT_BOUNDS = {
  desktop: { min: 1, max: 24 },
  mobile: { min: 1, max: 12 },
} as const;

function normalizeLayout(
  value: unknown,
  fallback: SectionLayout,
): SectionLayout {
  return value === "GRID" || value === "SCROLL" ? value : fallback;
}

/** Clamp a column count into the valid range for a breakpoint. Non-finite /
 *  out-of-range values fall back to (or toward) the default. */
export function clampSectionColumns(
  value: unknown,
  breakpoint: "desktop" | "mobile",
): number {
  const opts = SECTION_COLUMN_OPTIONS[breakpoint];
  const min = opts[0];
  const max = opts[opts.length - 1];
  const fallback = SECTION_DISPLAY_DEFAULTS[
    breakpoint === "desktop" ? "desktopColumns" : "mobileColumns"
  ];
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Clamp a "show first N" limit into the valid range for a breakpoint. */
export function clampSectionLimit(
  value: unknown,
  breakpoint: "desktop" | "mobile",
): number {
  const { min, max } = LIMIT_BOUNDS[breakpoint];
  const fallback = SECTION_DISPLAY_DEFAULTS[
    breakpoint === "desktop" ? "desktopLimit" : "mobileLimit"
  ];
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** How many product cards to put in a section's DOM: enough to satisfy the larger
 *  of the two per-breakpoint limits (CSS then hides the tail per breakpoint), but
 *  never more than SECTION_MAX_RENDER. */
export function sectionRenderCount(display: SectionDisplay): number {
  return Math.min(
    SECTION_MAX_RENDER,
    Math.max(display.desktopLimit, display.mobileLimit),
  );
}

/**
 * Read a section's display config, filling defaults and clamping columns. Accepts
 * a full ApiSection or any partial with the four fields (e.g. admin form values),
 * so both the storefront and the live preview resolve identically.
 */
export function resolveSectionDisplay(
  section: Partial<
    Pick<
      ApiSection,
      | "desktopLayout"
      | "desktopColumns"
      | "desktopLimit"
      | "mobileLayout"
      | "mobileColumns"
      | "mobileLimit"
    >
  > | null
  | undefined,
): SectionDisplay {
  return {
    desktopLayout: normalizeLayout(
      section?.desktopLayout,
      SECTION_DISPLAY_DEFAULTS.desktopLayout,
    ),
    desktopColumns: clampSectionColumns(section?.desktopColumns, "desktop"),
    desktopLimit: clampSectionLimit(section?.desktopLimit, "desktop"),
    mobileLayout: normalizeLayout(
      section?.mobileLayout,
      SECTION_DISPLAY_DEFAULTS.mobileLayout,
    ),
    mobileColumns: clampSectionColumns(section?.mobileColumns, "mobile"),
    mobileLimit: clampSectionLimit(section?.mobileLimit, "mobile"),
  };
}
