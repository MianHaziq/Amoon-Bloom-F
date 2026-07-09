import type { Locale } from "@/store/slices/ui.slice";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountry,
  type CountryCode,
  type CountryDef,
} from "./data";

export interface RegionCopy {
  city: string;
  country: string;
  countryCode: CountryCode;
}

/** Reverse-maps the `region` cookie value (backend `regionCode`) to a `CountryCode`. */
export function getCountryByRegionCode(regionCode?: string): CountryCode {
  const found = COUNTRIES.find((c) => c.regionCode === regionCode);
  return found?.code ?? DEFAULT_COUNTRY;
}

function cityLabel(def: CountryDef, city: string, locale: Locale): string {
  const idx = (def.cities as readonly string[]).indexOf(city);
  if (idx === -1) return city;
  return locale === "ar" ? def.citiesAr[idx] : def.cities[idx];
}

export function regionCopyFromCountryCity(
  country: CountryCode,
  city: string,
  locale: Locale
): RegionCopy {
  const def = getCountry(country);
  return {
    city: cityLabel(def, city, locale),
    country: locale === "ar" ? def.nameAr : def.name,
    countryCode: def.code,
  };
}

/** Server-side variant: derives region copy from the `region` cookie value (country-level only, no specific city). */
export function regionCopyFromRegionCode(
  regionCode: string | undefined,
  locale: Locale
): RegionCopy {
  const country = getCountryByRegionCode(regionCode);
  const def = getCountry(country);
  return regionCopyFromCountryCity(country, def.defaultCity, locale);
}
