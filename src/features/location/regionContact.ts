import type { Locale } from "@/store/slices/ui.slice";
import type { ApiRegion } from "@/features/regions/types";
import { getCachedRegions } from "@/services/catalogCache";
import { siteConfig } from "@/config/site";

export interface RegionContact {
  email: string;
  phone: string;
  whatsappNumber: string;
  /** Derived `https://wa.me/<digits>` link — never needs building at call sites. */
  whatsappUrl: string;
  address: string;
  hours: string;
  legalEntity: string;
  /** Region.code, e.g. "UAE" — the short form used in generic mentions like
   * "under UAE law" across the legal pages. Always present (every region has
   * a code); no fallback needed. */
  countryShort: string;
  /** Region.name (localized), e.g. "United Arab Emirates" — the long form
   * used in mentions like "governed by the laws of {countryName}". Always
   * present; no fallback needed. */
  countryName: string;
  /** Legal citations for the 5 storefront legal pages. Unlike the fields
   * above (which fall back to a real UAE-based site default), these fall
   * back to GENERIC, non-country-specific wording when a region hasn't set
   * them — e.g. "applicable intellectual property law" rather than UAE's
   * specific law number, since showing another region's specific citation
   * would be actively wrong, not just incomplete. New regions can't be
   * created without these set (see region.service.js); this fallback only
   * ever applies to a region that predates that requirement. Empty string
   * for `registrationCity` specifically signals "omit the city clause" —
   * callers building the "registered in {city}, {country}" / "courts of
   * {city}" sentences should conditionally include it. */
  registrationCity: string;
  currencyDisplayName: string;
  vatLawName: string;
  dataProtectionLawName: string;
  dataProtectionAuthority: string;
  ipLawName: string;
  consumerProtectionLawName: string;
  consumerProtectionAuthority: string;
  standardsAuthority: string;
}

type RegionContactFields = Pick<
  ApiRegion,
  | "code"
  | "name"
  | "name_ar"
  | "contactEmail"
  | "contactPhone"
  | "whatsappNumber"
  | "address"
  | "address_ar"
  | "hours"
  | "hours_ar"
  | "legalEntity"
  | "currency"
  | "registrationCity"
  | "registrationCity_ar"
  | "currencyDisplayName"
  | "currencyDisplayName_ar"
  | "vatLawName"
  | "vatLawName_ar"
  | "dataProtectionLawName"
  | "dataProtectionLawName_ar"
  | "dataProtectionAuthority"
  | "dataProtectionAuthority_ar"
  | "ipLawName"
  | "ipLawName_ar"
  | "consumerProtectionLawName"
  | "consumerProtectionLawName_ar"
  | "consumerProtectionAuthority"
  | "consumerProtectionAuthority_ar"
  | "standardsAuthority"
  | "standardsAuthority_ar"
>;

function toWhatsAppUrl(displayNumber: string): string {
  const digits = displayNumber.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : siteConfig.links.whatsapp;
}

/** Generic, non-country-specific fallback wording for a region that hasn't
 * set its legal citations yet (only possible for a region created before
 * this field became required at creation time). Never mentions a specific
 * jurisdiction, law number, or authority — that would just be wrong for
 * whichever region is actually missing it. */
const GENERIC_LEGAL_FALLBACK = {
  en: {
    vatLawName: "applicable VAT/tax law",
    dataProtectionLawName: "applicable data protection law",
    dataProtectionAuthority: "relevant data protection authority",
    ipLawName: "applicable intellectual property law",
    consumerProtectionLawName: "applicable consumer protection law",
    consumerProtectionAuthority: "relevant consumer protection authority",
    standardsAuthority: "relevant standards authority",
  },
  ar: {
    vatLawName: "قانون ضريبة القيمة المضافة المعمول به",
    dataProtectionLawName: "قانون حماية البيانات المعمول به",
    dataProtectionAuthority: "الجهة المختصة بحماية البيانات",
    ipLawName: "قانون الملكية الفكرية المعمول به",
    consumerProtectionLawName: "قانون حماية المستهلك المعمول به",
    consumerProtectionAuthority: "الجهة المختصة بحماية المستهلك",
    standardsAuthority: "الجهة المختصة بالمواصفات والمقاييس",
  },
} as const;

/** Picks `region.{field}` (localized to `locale`, falling back to the English
 *  value when no Arabic override exists) or the generic placeholder for that
 *  field when the region has neither. */
function legalField(
  region: RegionContactFields | null | undefined,
  field: keyof typeof GENERIC_LEGAL_FALLBACK["en"],
  locale: Locale
): string {
  const enKey = field;
  const arKey = `${field}_ar` as keyof RegionContactFields;
  const localized = locale === "ar" ? (region?.[arKey] as string | null)?.trim() : undefined;
  return (
    localized ||
    (region?.[enKey] as string | null)?.trim() ||
    GENERIC_LEGAL_FALLBACK[locale === "ar" ? "ar" : "en"][field]
  );
}

/**
 * Pure merge: a region's contact overrides (any of which may be null/unset)
 * layered over `siteConfig.contact`/`siteConfig.legalEntity` — the single
 * place this fallback logic lives, shared by every call site (server pages,
 * client components, the checkout receipt). `address`/`hours` pick the
 * localized value for `locale`, falling back to the English one when no
 * Arabic override is set (mirrors the name/name_ar convention).
 */
export function resolveRegionContact(
  region: RegionContactFields | null | undefined,
  locale: Locale
): RegionContact {
  const email = region?.contactEmail?.trim() || siteConfig.contact.email;
  const phone = region?.contactPhone?.trim() || siteConfig.contact.phone;
  const whatsappNumber = region?.whatsappNumber?.trim() || siteConfig.contact.whatsapp;
  const address =
    (locale === "ar" ? region?.address_ar?.trim() : undefined) ||
    region?.address?.trim() ||
    siteConfig.contact.address;
  const hours =
    (locale === "ar" ? region?.hours_ar?.trim() : undefined) ||
    region?.hours?.trim() ||
    siteConfig.contact.hours;
  const legalEntity = region?.legalEntity?.trim() || siteConfig.legalEntity;

  // Always present — every region has a code and a name — so no generic
  // fallback text is needed here, only an ultimate default for the
  // (practically unreachable) case regions failed to load at all.
  const countryShort = region?.code?.trim() || "UAE";
  const countryName =
    (locale === "ar" ? region?.name_ar?.trim() : undefined) ||
    region?.name?.trim() ||
    (locale === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates");

  // registrationCity has no generic-phrase fallback — an empty string signals
  // "omit the city clause" to the legal pages (see RegionContact doc-comment),
  // since there's no natural placeholder noun that reads well as a city name.
  const registrationCity =
    (locale === "ar" ? region?.registrationCity_ar?.trim() : undefined) ||
    region?.registrationCity?.trim() ||
    "";
  // currencyDisplayName falls back to the plain ISO currency code (e.g. "SAR")
  // rather than a generic phrase — always available (currency is a required
  // field on every region already) and never wrong, just terser than the full
  // "Saudi Riyals (SAR)" an admin would write.
  const currencyDisplayName =
    (locale === "ar" ? region?.currencyDisplayName_ar?.trim() : undefined) ||
    region?.currencyDisplayName?.trim() ||
    region?.currency ||
    "AED";

  return {
    email,
    phone,
    whatsappNumber,
    whatsappUrl: toWhatsAppUrl(whatsappNumber),
    address,
    hours,
    legalEntity,
    countryShort,
    countryName,
    registrationCity,
    currencyDisplayName,
    vatLawName: legalField(region, "vatLawName", locale),
    dataProtectionLawName: legalField(region, "dataProtectionLawName", locale),
    dataProtectionAuthority: legalField(region, "dataProtectionAuthority", locale),
    ipLawName: legalField(region, "ipLawName", locale),
    consumerProtectionLawName: legalField(region, "consumerProtectionLawName", locale),
    consumerProtectionAuthority: legalField(region, "consumerProtectionAuthority", locale),
    standardsAuthority: legalField(region, "standardsAuthority", locale),
  };
}

/**
 * Server-side: resolves contact info for the region behind the `region`
 * cookie value. Regions are request-deduped and cross-request cached (see
 * `catalogCache.ts`), so calling this from several marketing components in
 * the same page render is cheap, not a fetch storm — mirrors
 * `regionCopyFromRegionCode` in `regionCopy.ts`.
 */
export async function regionContactFromRegionCode(
  regionCode: string | undefined,
  locale: Locale
): Promise<RegionContact> {
  const regions = await getCachedRegions().catch<ApiRegion[]>(() => []);
  const region =
    regions.find((r) => r.code === regionCode) ??
    regions.find((r) => r.isDefault) ??
    null;
  return resolveRegionContact(region, locale);
}
