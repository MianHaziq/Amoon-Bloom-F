/**
 * Static delivery scope. Mirrors the mobile app's `CountryEntity.all`
 * (spec §3.3.1). When the boutique expands to additional GCC markets, add
 * the country code here, list its cities, and map the currency below.
 */
export const COUNTRIES = [
  {
    code: "UAE",
    // `regionCode` is the backend region `code` (GET /regions) sent as the
    // `X-Region` header / `?region=` param to scope catalog visibility.
    regionCode: "UAE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    flag: "🇦🇪",
    currency: "AED",
    locale: "en-AE",
    cities: ["Dubai", "Abu Dhabi", "Sharjah"],
    citiesAr: ["دبي", "أبوظبي", "الشارقة"],
    defaultCity: "Dubai",
  },
  {
    code: "SAUDI_ARABIA",
    regionCode: "SA",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    flag: "🇸🇦",
    currency: "SAR",
    locale: "en-SA",
    cities: ["Riyadh", "Jeddah", "Dammam"],
    citiesAr: ["الرياض", "جدة", "الدمام"],
    defaultCity: "Riyadh",
  },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export type CountryDef = (typeof COUNTRIES)[number];

export const DEFAULT_COUNTRY: CountryCode = "UAE";

export function getCountry(code: CountryCode): CountryDef {
  const found = COUNTRIES.find((c) => c.code === code);
  // Type assertion: COUNTRIES always contains DEFAULT_COUNTRY, and code is
  // typed against the const array — `found` is unreachable as undefined.
  return found ?? COUNTRIES[0];
}
