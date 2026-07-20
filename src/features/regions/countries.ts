/**
 * Country picker data for the admin "New region" flow. Names (English +
 * Arabic) are resolved at runtime via `Intl.DisplayNames` off the ISO
 * 3166-1 alpha-2 code — not hand-typed — so they're accurate for every
 * country without maintaining ~195 translated strings by hand. Currency is
 * the one piece `Intl` can't give us, so it's a curated ISO 4217 lookup
 * below: a helpful default the admin can always overwrite, never
 * authoritative (mirrors how `shippingFlatRate`/`legalEntity` already work
 * as editable suggestions, not locked values).
 *
 * The code list itself is exactly the flags we self-host in `/public/flags`
 * (see RegionFlag.tsx) — a country only shows up in the picker if we can
 * actually render its flag. A handful of non-country/alias codes in that set
 * (EU, UN — not countries at all; UK/FX/SU/YU/AN — historical aliases that
 * `Intl.DisplayNames` happily resolves to the SAME name as their modern
 * replacement: GB/FR/RU/RS/CW respectively) are excluded explicitly below —
 * confirmed by scanning every code for name collisions, not guessed.
 */

/** Not real, separately-selectable countries — either not a country at all
 *  (EU, UN) or a historical/alias code CLDR resolves to the same name as its
 *  modern replacement, which would otherwise show as a confusing duplicate
 *  (UK≡GB, FX≡FR, SU≡RU, YU≡RS, AN≡CW). XK (Kosovo) is kept even though it
 *  has no unique official ISO 3166-1 code — it doesn't duplicate anything. */
const EXCLUDED_ISO2 = new Set(["EU", "UN", "UK", "FX", "SU", "YU", "AN"]);

const FLAG_ISO2_CODES = [
  "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AN", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV",
  "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CP", "CQ", "CR",
  "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DG", "DJ", "DK", "DM", "DO", "DZ", "EA", "EC", "EE", "EG", "EH",
  "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "FX", "GA", "GB", "GD", "GE", "GF", "GG", "GH",
  "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU",
  "IC", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH",
  "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV",
  "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT",
  "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ",
  "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO",
  "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR",
  "SS", "ST", "SU", "SV", "SX", "SY", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN",
  "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UK", "UM", "UN", "US", "UY", "UZ", "VA", "VC", "VE", "VG",
  "VI", "VN", "VU", "WF", "WS", "XK", "XX", "YE", "YT", "YU", "ZA", "ZM", "ZW",
];

/** ISO 3166-1 alpha-2 -> ISO 4217 currency code. Covers UN member states and
 *  common territories; deliberately left blank (not guessed) for a handful of
 *  uninhabited/disputed/ambiguous codes rather than risk a wrong default. */
const CURRENCY_BY_ISO2: Record<string, string> = {
  AD: "EUR", AE: "AED", AF: "AFN", AG: "XCD", AI: "XCD", AL: "ALL", AM: "AMD", AO: "AOA", AR: "ARS",
  AS: "USD", AT: "EUR", AU: "AUD", AW: "AWG", AX: "EUR", AZ: "AZN", BA: "BAM", BB: "BBD", BD: "BDT",
  BE: "EUR", BF: "XOF", BG: "BGN", BH: "BHD", BI: "BIF", BJ: "XOF", BM: "BMD", BN: "BND", BO: "BOB",
  BQ: "USD", BR: "BRL", BS: "BSD", BT: "BTN", BW: "BWP", BY: "BYN", BZ: "BZD", CA: "CAD", CC: "AUD",
  CD: "CDF", CF: "XAF", CG: "XAF", CH: "CHF", CI: "XOF", CK: "NZD", CL: "CLP", CM: "XAF", CN: "CNY",
  CO: "COP", CR: "CRC", CU: "CUP", CV: "CVE", CW: "ANG", CX: "AUD", CY: "EUR", CZ: "CZK", DE: "EUR",
  DJ: "DJF", DK: "DKK", DM: "XCD", DO: "DOP", DZ: "DZD", EC: "USD", EE: "EUR", EG: "EGP", EH: "MAD",
  ER: "ERN", ES: "EUR", ET: "ETB", FI: "EUR", FJ: "FJD", FK: "FKP", FM: "USD", FO: "DKK", FR: "EUR",
  GA: "XAF", GB: "GBP", GD: "XCD", GE: "GEL", GF: "EUR", GG: "GBP", GH: "GHS", GI: "GIP", GL: "DKK",
  GM: "GMD", GN: "GNF", GP: "EUR", GQ: "XAF", GR: "EUR", GS: "GBP", GT: "GTQ", GU: "USD", GW: "XOF",
  GY: "GYD", HK: "HKD", HN: "HNL", HR: "EUR", HT: "HTG", HU: "HUF", ID: "IDR", IE: "EUR", IL: "ILS",
  IM: "GBP", IN: "INR", IO: "USD", IQ: "IQD", IR: "IRR", IS: "ISK", IT: "EUR", JE: "GBP", JM: "JMD",
  JO: "JOD", JP: "JPY", KE: "KES", KG: "KGS", KH: "KHR", KI: "AUD", KM: "KMF", KN: "XCD", KP: "KPW",
  KR: "KRW", KW: "KWD", KY: "KYD", KZ: "KZT", LA: "LAK", LB: "LBP", LC: "XCD", LI: "CHF", LK: "LKR",
  LR: "LRD", LS: "LSL", LT: "EUR", LU: "EUR", LV: "EUR", LY: "LYD", MA: "MAD", MC: "EUR", MD: "MDL",
  ME: "EUR", MF: "EUR", MG: "MGA", MH: "USD", MK: "MKD", ML: "XOF", MM: "MMK", MN: "MNT", MO: "MOP",
  MP: "USD", MQ: "EUR", MR: "MRU", MS: "XCD", MT: "EUR", MU: "MUR", MV: "MVR", MW: "MWK", MX: "MXN",
  MY: "MYR", MZ: "MZN", NA: "NAD", NC: "XPF", NE: "XOF", NF: "AUD", NG: "NGN", NI: "NIO", NL: "EUR",
  NO: "NOK", NP: "NPR", NR: "AUD", NU: "NZD", NZ: "NZD", OM: "OMR", PA: "PAB", PE: "PEN", PF: "XPF",
  PG: "PGK", PH: "PHP", PK: "PKR", PL: "PLN", PM: "EUR", PN: "NZD", PR: "USD", PS: "ILS", PT: "EUR",
  PW: "USD", PY: "PYG", QA: "QAR", RE: "EUR", RO: "RON", RS: "RSD", RU: "RUB", RW: "RWF", SA: "SAR",
  SB: "SBD", SC: "SCR", SD: "SDG", SE: "SEK", SG: "SGD", SH: "SHP", SI: "EUR", SJ: "NOK", SK: "EUR",
  SL: "SLE", SM: "EUR", SN: "XOF", SO: "SOS", SR: "SRD", SS: "SSP", ST: "STN", SV: "USD", SX: "ANG",
  SY: "SYP", SZ: "SZL", TC: "USD", TD: "XAF", TG: "XOF", TH: "THB", TJ: "TJS", TK: "NZD", TL: "USD",
  TM: "TMT", TN: "TND", TO: "TOP", TR: "TRY", TT: "TTD", TV: "AUD", TW: "TWD", TZ: "TZS", UA: "UAH",
  UG: "UGX", US: "USD", UY: "UYU", UZ: "UZS", VA: "EUR", VC: "XCD", VE: "VES", VG: "USD", VI: "USD",
  VN: "VND", VU: "VUV", WF: "XPF", WS: "WST", YE: "YER", YT: "EUR", ZA: "ZAR", ZM: "ZMW", ZW: "ZWL",
};

export interface CountryOption {
  iso2: string;
  nameEn: string;
  nameAr: string;
  /** ISO 4217 code, or null when we don't have a confident default. */
  currency: string | null;
}

let cache: CountryOption[] | null = null;

/**
 * All flag-backed countries with resolvable ISO names, sorted by English
 * name. Computed once per session (pure function of static data + the
 * runtime's ICU data, not of any component state).
 */
export function getCountryOptions(): CountryOption[] {
  if (cache) return cache;

  const dnEn = new Intl.DisplayNames(["en"], { type: "region" });
  const dnAr = new Intl.DisplayNames(["ar"], { type: "region" });

  const options: CountryOption[] = [];
  for (const code of FLAG_ISO2_CODES) {
    if (EXCLUDED_ISO2.has(code)) continue;
    let nameEn: string | undefined;
    let nameAr: string | undefined;
    try {
      nameEn = dnEn.of(code);
      nameAr = dnAr.of(code);
    } catch {
      continue; // not a resolvable region code (e.g. a legacy/reserved code)
    }
    // Intl echoes the input back unchanged when it can't resolve a name —
    // that's how we drop the non-country codes mixed into the flag set
    // (EU, UK, UN, XK, historical codes like SU/YU/AN) without maintaining
    // an exclusion list by hand.
    if (!nameEn || nameEn === code) continue;
    options.push({
      iso2: code,
      nameEn,
      nameAr: nameAr && nameAr !== code ? nameAr : nameEn,
      currency: CURRENCY_BY_ISO2[code] ?? null,
    });
  }
  options.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  cache = options;
  return options;
}
