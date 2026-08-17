"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { Select } from "@/components/admin/Select";
import { ChevronDown, PlusIcon, TrashIcon } from "@/components/icons";
import { RegionFlag } from "@/features/location/components/RegionFlag";
import { CountryPicker } from "./CountryPicker";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import { vatApi } from "@/features/vat/api/vat.api";
import { termsVatClause, shippingVatClause } from "@/features/vat/vatLegalClause";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { useToast } from "@/hooks/useToast";
import type { ApiRegion, ApiRegionCreateInput } from "@/features/regions/types";
import type { CountryOption } from "@/features/regions/countries";
import type { ApiPublicVatConfig, ApiVatConfig } from "@/features/vat/types";

interface RegionFormProps {
  initial?: ApiRegion;
  onSubmit: (payload: ApiRegionCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

/** Curated IANA timezone list for the region picker — GCC first, since that's
 *  where every live region operates today. Kept short on purpose: this drives
 *  same-day cutoff / allowed-weekday / blackout math, so it's the operating
 *  timezone, not a full tz database dump. */
const TIMEZONE_OPTIONS = [
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Qatar",
  "Asia/Kuwait",
  "Asia/Bahrain",
  "Asia/Muscat",
] as const;

const DEFAULT_TIMEZONE = "Asia/Dubai";

/** Matches the visual language of the `Input` component (rounded-2xl, bloom focus
 *  ring) for the native controls (timezone <select>, blackout date/time inputs)
 *  that the `Input` wrapper doesn't cover. */
const NATIVE_CONTROL_CLASS =
  "h-[50px] w-full rounded-2xl border border-ink-200 bg-white px-4 text-base text-ink-900 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100";

/** 0=Sun..6=Sat, matching the backend's `deliveryDays` convention. Each maps to
 *  a short weekday i18n key rendered as a checkbox. */
const WEEKDAYS: { day: number; labelKey: string }[] = [
  { day: 0, labelKey: "weekdaySun" },
  { day: 1, labelKey: "weekdayMon" },
  { day: 2, labelKey: "weekdayTue" },
  { day: 3, labelKey: "weekdayWed" },
  { day: 4, labelKey: "weekdayThu" },
  { day: 5, labelKey: "weekdayFri" },
  { day: 6, labelKey: "weekdaySat" },
];

/** The 9 legal-citation base names — each gets an English + `_ar` field.
 *  Required on create (see createSchema below), optional on edit, mirroring
 *  the backend's identical split in region.service.js. */
const LEGAL_FIELD_BASE_NAMES = [
  "registrationCity",
  "currencyDisplayName",
  "vatLawName",
  "dataProtectionLawName",
  "dataProtectionAuthority",
  "ipLawName",
  "consumerProtectionLawName",
  "consumerProtectionAuthority",
  "standardsAuthority",
] as const;

type LegalFieldName = (typeof LEGAL_FIELD_BASE_NAMES)[number];

interface LegalFieldMeta {
  name: LegalFieldName;
  labelKey: string;
  arLabelKey: string;
  placeholder: string;
  arPlaceholder: string;
  hintKey?: string;
}

// Placeholders are UAE's own real, verified citations (not invented examples
// for a hypothetical country) — they illustrate the expected specificity
// without ever reading as a suggested value for whichever region is actually
// being created. Keyed by field name (not an array) because a few fields are
// reused across more than one storefront page/clause (see LEGAL_PAGE_GROUPS
// below) and need to be looked up from multiple places.
const LEGAL_FIELD_META: Record<LegalFieldName, LegalFieldMeta> = {
  registrationCity: {
    name: "registrationCity",
    labelKey: "registrationCityLabel",
    arLabelKey: "registrationCityArLabel",
    placeholder: "Dubai",
    arPlaceholder: "دبي",
    hintKey: "registrationCityHint",
  },
  currencyDisplayName: {
    name: "currencyDisplayName",
    labelKey: "currencyDisplayNameLabel",
    arLabelKey: "currencyDisplayNameArLabel",
    placeholder: "UAE Dirhams (AED)",
    arPlaceholder: "الدرهم الإماراتي",
  },
  vatLawName: {
    name: "vatLawName",
    labelKey: "vatLawNameLabel",
    arLabelKey: "vatLawNameArLabel",
    placeholder: "UAE Federal Decree-Law on Value Added Tax",
    arPlaceholder: "المرسوم بقانون اتحادي بشأن ضريبة القيمة المضافة",
  },
  dataProtectionLawName: {
    name: "dataProtectionLawName",
    labelKey: "dataProtectionLawNameLabel",
    arLabelKey: "dataProtectionLawNameArLabel",
    placeholder: "UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)",
    arPlaceholder: "المرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية (PDPL)",
  },
  dataProtectionAuthority: {
    name: "dataProtectionAuthority",
    labelKey: "dataProtectionAuthorityLabel",
    arLabelKey: "dataProtectionAuthorityArLabel",
    placeholder: "UAE Data Office",
    arPlaceholder: "مكتب البيانات الإماراتي",
  },
  ipLawName: {
    name: "ipLawName",
    labelKey: "ipLawNameLabel",
    arLabelKey: "ipLawNameArLabel",
    placeholder: "UAE Federal Law No. 38 of 2021 on Intellectual Property Rights",
    arPlaceholder: "القانون الاتحادي رقم 38 لسنة 2021 بشأن الحقوق المعنوية",
  },
  consumerProtectionLawName: {
    name: "consumerProtectionLawName",
    labelKey: "consumerProtectionLawNameLabel",
    arLabelKey: "consumerProtectionLawNameArLabel",
    placeholder: "UAE Federal Law No. 15 of 2020 on Consumer Protection",
    arPlaceholder: "القانون الاتحادي الإماراتي رقم 15 لسنة 2020 بشأن حماية المستهلك",
  },
  consumerProtectionAuthority: {
    name: "consumerProtectionAuthority",
    labelKey: "consumerProtectionAuthorityLabel",
    arLabelKey: "consumerProtectionAuthorityArLabel",
    placeholder: "UAE Ministry of Economy Consumer Protection Department",
    arPlaceholder: "إدارة حماية المستهلك في وزارة الاقتصاد الإماراتية",
  },
  standardsAuthority: {
    name: "standardsAuthority",
    labelKey: "standardsAuthorityLabel",
    arLabelKey: "standardsAuthorityArLabel",
    placeholder: "Emirates Authority for Standardisation and Metrology (ESMA)",
    arPlaceholder: "هيئة الإمارات للمواصفات والمقاييس (ESMA)",
  },
};

// The company/legal-entity name is woven through most legal clauses (and is
// itself region-editable via the `legalEntity` field). These are the literal
// forms embedded in the example copy below, highlighted like any other
// region-specific value so the admin sees it changes per region too.
const LEGAL_ENTITY_EXAMPLE_TERMS = ["Amoon Bloom Trading LLC", "أمون بلوم للتجارة ذ.م.م"];

/**
 * Assumed VAT treatment for the "how it reads" preview when there's no real
 * VatConfig to read yet — create mode (the region doesn't exist, so it can't
 * have one), or the live config still loading/erroring in edit mode. Exclusive
 * is the standard: every real region is set up VAT-exclusive, and a brand-new
 * region is created VAT-exclusive by convention too, so the preview should
 * show that full clause by default rather than a bare "no VAT mentioned"
 * placeholder that reads as broken. An EXISTING, already-configured region
 * (even one deliberately VAT-disabled, like Morocco) always uses its own real
 * config once loaded — this default only fills the gap before real data exists.
 */
const DEFAULT_PREVIEW_VAT: ApiPublicVatConfig = {
  enabled: true,
  ratePercent: 5,
  inclusive: false,
  appliesTo: "ALL_PRODUCTS",
};

/**
 * Renders a storefront-preview sentence with the region-specific citation
 * value(s) highlighted in brand pink, so the admin can see at a glance exactly
 * which words in the clause are the thing their field replaces. `terms` are the
 * (placeholder) substrings embedded verbatim in the example — matches are
 * merged so overlapping/adjacent terms don't produce nested marks.
 */
function highlightExample(text: string, terms: string[]): ReactNode {
  const ranges: { start: number; end: number }[] = [];
  for (const term of terms) {
    if (!term) continue;
    let from = text.indexOf(term);
    while (from !== -1) {
      ranges.push({ start: from, end: from + term.length });
      from = text.indexOf(term, from + term.length);
    }
  }
  if (ranges.length === 0) return text;

  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;
  merged.forEach((r, i) => {
    if (r.start > cursor) nodes.push(text.slice(cursor, r.start));
    nodes.push(
      <mark
        key={`h${i}`}
        className="rounded bg-bloom-50 px-1 font-medium text-bloom-700"
      >
        {text.slice(r.start, r.end)}
      </mark>
    );
    cursor = r.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * Legal citations grouped by the storefront PAGE they actually appear on (not
 * by field) — each group is its own tappable/collapsible section showing the
 * real clause text (UAE's actual live copy, word-for-word) so the admin can
 * see exactly where a citation lands before typing the new region's version.
 *
 * A few citations are reused across multiple pages (consumerProtectionLawName
 * appears on Refund Policy, Shipping Policy, AND Product Disclaimer). Rather
 * than rendering the same input three times, ONE real input lives on its
 * primary page (Refund Policy) and the other pages show a "reference" block:
 * the same clause context, but pointing back at the primary page instead of a
 * second editable box — one source of truth, no risk of the two drifting.
 */
interface LegalExampleBlock {
  kind: "field";
  fieldNames: [LegalFieldName] | [LegalFieldName, LegalFieldName];
  clauseTitle: string;
  clauseTitleAr: string;
  example: string;
  exampleAr: string;
  /** A second clause on the SAME page that reuses this exact value. */
  alsoUsedIn?: string;
  /** When set, `example`/`exampleAr` above are only a pre-load fallback — the
   *  real "how it reads on the storefront" preview is instead computed live
   *  from this region's actual VatConfig plus the currently-typed
   *  currencyDisplayName/vatLawName, via the SAME `termsVatClause`/
   *  `shippingVatClause` functions the storefront pages call. This is the one
   *  clause whose wording genuinely forks (inclusive vs exclusive vs no-VAT)
   *  based on a setting from a different admin page (Tax (VAT)) — a static
   *  example would silently go stale the moment that setting changes. */
  dynamicExample?: "terms" | "shipping";
}
interface LegalReferenceBlock {
  kind: "reference";
  fieldNames: LegalFieldName[];
  clauseTitle: string;
  clauseTitleAr: string;
  example: string;
  exampleAr: string;
  /** Key into LEGAL_PAGE_GROUPS holding the real, editable input. */
  referencesGroupKey: string;
  /** See LegalExampleBlock.dynamicExample. */
  dynamicExample?: "terms" | "shipping";
}
interface LegalFooterBlock {
  kind: "footer";
  example: string;
  exampleAr: string;
}
type LegalBlock = LegalExampleBlock | LegalReferenceBlock | LegalFooterBlock;

interface LegalPageGroup {
  key: string;
  pageNameKey: string;
  href: string;
  blocks: LegalBlock[];
}

const LEGAL_PAGE_GROUPS: LegalPageGroup[] = [
  {
    key: "terms",
    pageNameKey: "legalPageTerms",
    href: "/terms",
    blocks: [
      {
        kind: "field",
        fieldNames: ["registrationCity"],
        clauseTitle: "2. About Us",
        clauseTitleAr: "2. من نحن",
        example:
          "Amoon Bloom Trading LLC is an online e-commerce business registered and operating in Dubai, United Arab Emirates, offering gift boxes, flower bouquets, flower mugs, newborn gifts, natural oil, and other gift items.",
        exampleAr:
          "شركة أمون بلوم للتجارة ذ.م.م هي متجر إلكتروني مسجل ويعمل في دبي، الإمارات العربية المتحدة، ويقدم صناديق الهدايا وباقات الزهور وأكواب الزهور وهدايا المواليد والزيوت الطبيعية ومنتجات الهدايا الأخرى.",
        alsoUsedIn: "9. Governing Law & Dispute Resolution",
      },
      {
        kind: "field",
        fieldNames: ["currencyDisplayName", "vatLawName"],
        clauseTitle: "3. Products & Availability",
        clauseTitleAr: "3. المنتجات والتوفر",
        // Fallback only, shown before this region's VatConfig has loaded — the
        // real preview is computed live (see dynamicExample below).
        example:
          "Prices are displayed in UAE Dirhams (AED) and are exclusive of VAT where applicable. Applicable VAT is added at checkout in accordance with UAE Federal Decree-Law on Value Added Tax.",
        exampleAr:
          "تعرض الأسعار بالدرهم الإماراتي ولا تشمل ضريبة القيمة المضافة حيثما ينطبق ذلك. تضاف ضريبة القيمة المضافة المستحقة عند إتمام الطلب بموجب المرسوم بقانون اتحادي بشأن ضريبة القيمة المضافة.",
        dynamicExample: "terms",
      },
      {
        kind: "field",
        fieldNames: ["ipLawName"],
        clauseTitle: "7. Intellectual Property",
        clauseTitleAr: "7. الملكية الفكرية",
        example:
          "All content on the Amoon Bloom Trading LLC website including text, images, logos, and product designs is the intellectual property of Amoon Bloom Trading LLC or its licensors and is protected under UAE Federal Law No. 38 of 2021 on Intellectual Property Rights. Reproduction, distribution, or commercial use without written permission is strictly prohibited.",
        exampleAr:
          "يعد كل محتوى موقع أمون بلوم للتجارة ذ.م.م، بما في ذلك النصوص والصور والشعارات وتصاميم المنتجات، ملكية فكرية للشركة أو مرخصيها، ويخضع للحماية بموجب القانون الاتحادي رقم 38 لسنة 2021 بشأن الحقوق المعنوية. ويحظر نسخه أو توزيعه أو استخدامه تجاريا دون إذن كتابي.",
      },
    ],
  },
  {
    key: "privacy",
    pageNameKey: "legalPagePrivacy",
    href: "/privacy",
    blocks: [
      {
        kind: "field",
        fieldNames: ["dataProtectionLawName"],
        clauseTitle: "1. Introduction",
        clauseTitleAr: "1. مقدمة",
        example:
          'Amoon Bloom Trading LLC ("we", "us", or "our") is committed to protecting your personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and applicable regulations. This Privacy Policy explains how we collect, use, store, and protect your information when you visit or make a purchase on our website.',
        exampleAr:
          'تلتزم شركة أمون بلوم للتجارة ذ.م.م ("نحن" أو "لنا") بحماية بياناتك الشخصية بموجب المرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية (PDPL) واللوائح المعمول بها. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وتخزيننا وحمايتنا لمعلوماتك عند زيارتك لموقعنا أو الشراء منه.',
        alsoUsedIn: "9. Data Security",
      },
      {
        kind: "field",
        fieldNames: ["dataProtectionAuthority"],
        clauseTitle: "7. Your Rights",
        clauseTitleAr: "7. حقوقك",
        example:
          "Under UAE law, you have the right to: Access the personal data we hold about you / Request correction of inaccurate or incomplete data / Request deletion of your personal data, subject to legal retention obligations / Withdraw consent for marketing communications at any time / Lodge a complaint with the UAE Data Office.",
        exampleAr:
          "بموجب قانون دولة الإمارات، يحق لك: الوصول إلى بياناتك الشخصية التي نحتفظ بها / طلب تصحيح البيانات غير الدقيقة أو الناقصة / طلب حذف بياناتك الشخصية، مع مراعاة الالتزامات القانونية بالاحتفاظ بالبيانات / سحب موافقتك على المراسلات التسويقية في أي وقت / تقديم شكوى إلى مكتب البيانات الإماراتي.",
      },
    ],
  },
  {
    key: "refund",
    pageNameKey: "legalPageRefund",
    href: "/refund-policy",
    blocks: [
      {
        kind: "field",
        fieldNames: ["consumerProtectionLawName", "consumerProtectionAuthority"],
        clauseTitle: "8. Consumer Rights",
        clauseTitleAr: "8. حقوق المستهلك",
        example:
          "Nothing in this policy limits or excludes your rights as a consumer under UAE Federal Law No. 15 of 2020 on Consumer Protection and the applicable laws. In the event of a dispute, you may also refer your complaint to the UAE Ministry of Economy Consumer Protection Department.",
        exampleAr:
          "لا يحد أي بند في هذه السياسة من حقوقك كمستهلك بموجب القانون الاتحادي الإماراتي رقم 15 لسنة 2020 بشأن حماية المستهلك والقوانين المعمول بها الأخرى، أو يستثنيها. وفي حال وجود نزاع، يمكنك أيضا إحالة شكواك إلى إدارة حماية المستهلك في وزارة الاقتصاد الإماراتية.",
      },
    ],
  },
  {
    key: "shipping",
    pageNameKey: "legalPageShipping",
    href: "/shipping-policy",
    blocks: [
      {
        kind: "reference",
        fieldNames: ["currencyDisplayName", "vatLawName"],
        clauseTitle: "4. Product Prices & VAT",
        clauseTitleAr: "4. أسعار المنتجات وضريبة القيمة المضافة",
        // Fallback only, shown before this region's VatConfig has loaded — the
        // real preview is computed live (see dynamicExample below).
        example:
          "All product prices displayed on our website are listed in UAE Dirhams (AED) and are exclusive of VAT where applicable. Applicable VAT is calculated and added at checkout before you complete your order, in accordance with UAE Federal Decree-Law on Value Added Tax. Your order total at checkout will show the product subtotal, delivery charges, and VAT separately where applicable.",
        exampleAr:
          "تعرض جميع أسعار المنتجات على موقعنا بالدرهم الإماراتي ولا تشمل ضريبة القيمة المضافة حيثما ينطبق ذلك. يتم احتساب ضريبة القيمة المضافة المستحقة وإضافتها عند إتمام الطلب قبل إكمال طلبك، بموجب المرسوم بقانون اتحادي بشأن ضريبة القيمة المضافة. سيوضح إجمالي طلبك عند إتمام الشراء إجمالي المنتجات ورسوم التوصيل وضريبة القيمة المضافة بشكل منفصل حيثما ينطبق ذلك.",
        referencesGroupKey: "terms",
        dynamicExample: "shipping",
      },
      {
        kind: "reference",
        fieldNames: ["consumerProtectionLawName"],
        clauseTitle: "9. Failed or Delayed Deliveries",
        clauseTitleAr: "9. حالات التسليم الفاشلة أو المتأخرة",
        example:
          "In the event of a delivery failure caused by us (not attributable to customer error or force majeure), we will re-deliver at no additional charge or issue a full refund at the customer's election, in accordance with UAE Federal Law No. 15 of 2020 on Consumer Protection.",
        exampleAr:
          "في حال حدوث فشل في التسليم بسبب خطأ من جانبنا (وليس بسبب خطأ من العميل أو ظرف قاهر)، سنقوم بإعادة التسليم دون أي رسوم إضافية أو نصدر استردادا كاملا حسب اختيار العميل، بموجب القانون الاتحادي الإماراتي رقم 15 لسنة 2020 بشأن حماية المستهلك.",
        referencesGroupKey: "refund",
      },
    ],
  },
  {
    key: "disclaimer",
    pageNameKey: "legalPageDisclaimer",
    href: "/product-disclaimer",
    blocks: [
      {
        kind: "reference",
        fieldNames: ["consumerProtectionLawName"],
        clauseTitle: "7. General Limitation",
        clauseTitleAr: "7. تحديد عام للمسؤولية",
        example:
          "Amoon Bloom Trading LLC makes no warranties, express or implied, beyond those required by UAE Federal Law No. 15 of 2020 on Consumer Protection and the applicable laws. Our products are sold as gifts and are not intended for medical, therapeutic, or professional use unless explicitly stated.",
        exampleAr:
          "لا تقدم شركة أمون بلوم للتجارة ذ.م.م أي ضمانات، صريحة أو ضمنية، تتجاوز ما يقتضيه القانون الاتحادي الإماراتي رقم 15 لسنة 2020 بشأن حماية المستهلك والقوانين المعمول بها الأخرى. وتباع منتجاتنا كهدايا وليست مخصصة للاستخدام الطبي أو العلاجي أو المهني ما لم يذكر ذلك صراحة.",
        referencesGroupKey: "refund",
      },
      {
        kind: "field",
        fieldNames: ["standardsAuthority"],
        clauseTitle: "8. Regulatory Compliance",
        clauseTitleAr: "8. الامتثال التنظيمي",
        example:
          "All products sold by Amoonis Boutique are sourced from suppliers who comply with applicable laws and standards in United Arab Emirates. We are committed to consumer safety and adhere to the requirements of the Emirates Authority for Standardisation and Metrology (ESMA) where applicable.",
        exampleAr:
          "يتم توريد جميع المنتجات التي تبيعها أموونيس بوتيك من موردين يلتزمون بالقوانين والمعايير المعمول بها في الإمارات العربية المتحدة. ونحن ملتزمون بسلامة المستهلك ونتقيد بمتطلبات هيئة الإمارات للمواصفات والمقاييس (ESMA) حيثما ينطبق ذلك.",
      },
    ],
  },
  {
    key: "footer",
    pageNameKey: "legalPageFooter",
    href: "/",
    blocks: [
      {
        kind: "footer",
        example:
          "Gift boxes, floral bouquets, newborn keepsakes, and occasion gifts - thoughtfully curated and prepared with care at Amoon Boutique in United Arab Emirates.",
        exampleAr:
          "علب هدايا، وباقات ورد، وهدايا للمواليد، وهدايا المناسبات - منسقة ومجهزة بعناية في Amoon Boutique في الإمارات العربية المتحدة.",
      },
    ],
  },
];

export function RegionForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
}: RegionFormProps) {
  const { t, locale } = useT();
  // No explicit `mode` prop (unlike UserForm) — RegionForm has always inferred
  // create vs. edit from whether `initial` is present, and every caller
  // already relies on that.
  const isCreate = !initial;

  // Feeds the "3. Products & Availability" / "4. Product Prices & VAT" preview
  // blocks below — reuses the SAME list query as the Tax (VAT) admin page so
  // the two share one cache entry. Disabled in create mode: a region that
  // doesn't exist yet has no VatConfig row to read (see vatApi.list()'s
  // "disabled default" doc comment for why every EXISTING region always has
  // an entry, never a 404).
  const vatConfigsQuery = useQuery({
    queryKey: queryKeys.vat.list(),
    queryFn: () => vatApi.list(),
    enabled: !isCreate,
  });
  // `!isCreate` is checked FIRST and short-circuits before touching
  // `vatConfigsQuery` at all — `enabled: false` above only skips the fetch, it
  // doesn't stop `useQuery` from surfacing another component's already-cached
  // data for the same key (e.g. a prior visit to Tax (VAT), which shares this
  // exact query key) as `isSuccess: true`. Gating on `isCreate` directly, not
  // `vatConfigsQuery.isSuccess`, keeps create mode's default deterministic
  // regardless of what's sitting in the cache.
  // `realVatConfig` is null unless this region's actual config is loaded (edit
  // mode only) — used to decide whether the inclusive/exclusive control below
  // is actionable yet. `regionVatConfig` (fed to the clause builders) is never
  // null: it falls back to the exclusive default when there's nothing real yet.
  const realVatConfig: ApiVatConfig | null =
    !isCreate && vatConfigsQuery.isSuccess
      ? vatConfigsQuery.data?.find((c) => c.regionId === initial.id) ?? null
      : null;
  const regionVatConfig: ApiPublicVatConfig = realVatConfig ?? DEFAULT_PREVIEW_VAT;
  // The clause only ever mentions VAT (inclusive OR exclusive) once VAT is
  // actually enabled with a real rate for this region — matches vatClauseKind's
  // own gate. Below that threshold, toggling inclusive/exclusive has no visible
  // effect on the storefront text, so the control stays hidden rather than
  // silently doing nothing when clicked.
  const vatTreatmentIsEditable = Boolean(realVatConfig?.enabled && realVatConfig.ratePercent > 0);

  const queryClient = useQueryClient();
  const toast = useToast();
  const vatInclusiveMutation = useMutation({
    mutationFn: (inclusive: boolean) => {
      if (!initial) throw new Error("Region must be saved before its VAT treatment can be set");
      return vatApi.update(initial.id, { inclusive });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiVatConfig[]>(queryKeys.vat.list(), (prev) =>
        (prev ?? []).map((c) => (c.regionId === updated.regionId ? updated : c))
      );
      toast.success({ title: t("admin.regionForm.vatTreatmentSaved") });
      // Same cache tag VatSettingsPage busts on save — the Terms & Conditions /
      // Shipping Policy pages read this via an SSR cache (getCachedVatPublic),
      // so the wording updates immediately instead of after the cache TTL.
      revalidateCatalog(["vat"]);
    },
    onError: (err) => toast.fromError(t("admin.regionForm.vatTreatmentSaveError"), err),
  });

  const { createSchema, editSchema } = useMemo(() => {
    const base = z.object({
      code: z
        .string()
        .min(2, t("admin.regionForm.codeMin"))
        .max(10, t("admin.regionForm.codeMax")),
      name: z.string().min(1, t("admin.regionForm.nameRequired")),
      name_ar: z.string().optional().nullable(),
      currency: z
        .string()
        .length(3, t("admin.regionForm.currencyLength"))
        .toUpperCase(),
      legalEntity: z.string().max(200, t("admin.regionForm.legalEntityMax")).optional(),
      shippingFlatRate: z.number().nonnegative(t("admin.regionForm.shippingFlatRateMin")).nullable(),
      standardDeliveryDays: z
        .number()
        .int(t("admin.regionForm.standardDeliveryDaysWhole"))
        .nonnegative(t("admin.regionForm.standardDeliveryDaysMin"))
        .nullable(),
      // City-level delivery configuration. Defaults live in `defaultValues`
      // below (not `.default()` here) so the schema's input and output types
      // stay identical — the resolver cast relies on that, exactly like the
      // rest of this schema.
      timezone: z.string().min(1),
      freeDeliveryThreshold: z
        .number()
        .nonnegative(t("admin.regionForm.freeDeliveryThresholdMin"))
        .nullable(),
      deliveryDays: z.array(z.number().int().min(0).max(6)),
      sameDayEnabled: z.boolean(),
      // Kept as a plain string in form state ("" = none) to avoid a null in a
      // controlled time input; normalized to null on submit.
      sameDayCutoff: z.string(),
      codEnabled: z.boolean(),
      onlinePaymentEnabled: z.boolean(),
      blackoutDates: z.array(
        z.object({
          id: z.string().optional(),
          date: z.string(),
          label: z.string(),
          label_ar: z.string(),
        })
      ),
      iso2: z
        .string()
        .refine((v) => v === "" || /^[A-Za-z]{2}$/.test(v), t("admin.regionForm.iso2Invalid"))
        .optional(),
      urlSlug: z
        .string()
        .refine((v) => v === "" || /^[a-z0-9-]+$/.test(v), t("admin.regionForm.urlSlugInvalid"))
        .optional(),
      contactEmail: z
        .string()
        .refine((v) => v === "" || z.string().email().safeParse(v).success, t("admin.regionForm.contactEmailInvalid"))
        .optional(),
      contactPhone: z.string().optional(),
      whatsappNumber: z.string().optional(),
      address: z.string().optional(),
      address_ar: z.string().optional(),
      hours: z.string().optional(),
      hours_ar: z.string().optional(),
      instagramUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      tiktokUrl: z.string().optional(),
      threadsUrl: z.string().optional(),
      snapchatUrl: z.string().optional(),
      xUrl: z.string().optional(),
      youtubeUrl: z.string().optional(),
      sortOrder: z
        .number()
        .int(t("admin.regionForm.sortOrderWhole"))
        .min(0, t("admin.regionForm.sortOrderMin")),
      isDefault: z.boolean(),
      isActive: z.boolean(),
    });

    // The 18 legal-citation fields are OPTIONAL for BOTH create and edit now —
    // legal pages are authored per region in the rich-text Pages editor
    // (RegionLegalPage), so a region no longer needs its law citations filled in
    // up front just to be created. They remain editable here as seed values for
    // the Pages editor's "Load default template" action.
    // Cast to a Record keyed by the literal field-name UNION (not `string`) —
    // a plain `Record<string, ...>` makes Zod's `.extend()` infer an index
    // signature, which then poisons every OTHER field on the schema (code,
    // sortOrder, isDefault, ...) into being typed as this field's type too.
    type LegalKey = (typeof LEGAL_FIELD_BASE_NAMES)[number] | `${(typeof LEGAL_FIELD_BASE_NAMES)[number]}_ar`;
    const optionalLegalShape = Object.fromEntries(
      LEGAL_FIELD_BASE_NAMES.flatMap((f) => [
        [f, z.string().optional()],
        [`${f}_ar`, z.string().optional()],
      ])
    ) as Record<LegalKey, z.ZodOptional<z.ZodString>>;

    return {
      createSchema: base.extend(optionalLegalShape),
      editSchema: base.extend(optionalLegalShape),
    };
  }, [t]);

  type FormValues = z.infer<typeof createSchema>;

  const legalDefaults = Object.fromEntries(
    LEGAL_FIELD_BASE_NAMES.flatMap((f) => [
      [f, ""],
      [`${f}_ar`, ""],
    ])
  ) as Partial<FormValues>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      (isCreate ? createSchema : editSchema) as unknown as typeof createSchema
    ),
    defaultValues: {
      code: "",
      name: "",
      name_ar: "",
      currency: "AED",
      legalEntity: "",
      shippingFlatRate: null,
      standardDeliveryDays: null,
      timezone: DEFAULT_TIMEZONE,
      freeDeliveryThreshold: null,
      deliveryDays: [],
      sameDayEnabled: false,
      sameDayCutoff: "",
      codEnabled: true,
      onlinePaymentEnabled: false,
      blackoutDates: [],
      iso2: "",
      urlSlug: "",
      contactEmail: "",
      contactPhone: "",
      whatsappNumber: "",
      address: "",
      address_ar: "",
      hours: "",
      hours_ar: "",
      instagramUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      threadsUrl: "",
      snapchatUrl: "",
      xUrl: "",
      youtubeUrl: "",
      ...legalDefaults,
      sortOrder: 0,
      isDefault: false,
      isActive: true,
    },
  });

  const iso2Value = watch("iso2");
  const allValues = watch();
  const sameDayEnabled = watch("sameDayEnabled");
  const selectedDeliveryDays = watch("deliveryDays") ?? [];

  const {
    fields: blackoutFields,
    append: appendBlackout,
    remove: removeBlackout,
  } = useFieldArray({ control, name: "blackoutDates" });

  // deliveryDays is a number[] (0=Sun..6=Sat), not a set of boolean flags, so the
  // weekday checkboxes are driven manually rather than via `register` (which would
  // collect checked values as strings). Kept sorted so the payload is stable.
  const toggleDeliveryDay = (day: number) => {
    const current = watch("deliveryDays") ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    setValue("deliveryDays", next, { shouldDirty: true });
  };

  // Only meaningful in edit mode — a create-mode field can never be empty at
  // this point (Zod already blocked submission). Flags a field left over from
  // before this requirement existed (Saudi Arabia, Morocco) so it's obvious,
  // not just a blank input indistinguishable from any other optional field.
  const legalNeedsReview = (field: string): string | undefined =>
    !isCreate && !String((allValues as unknown as Record<string, string | undefined>)[field] ?? "").trim()
      ? t("admin.regionForm.legalFieldNeedsReview")
      : undefined;

  // Each storefront-page group of legal citations is independently tappable to
  // hide/show — the toggle always works, in both directions, regardless of the
  // group's content. Only the STARTING state differs: create mode starts every
  // group open (everything is required — nothing to hide yet); edit mode
  // starts a group open only if it has a citation left blank from before this
  // feature existed, otherwise collapsed (most edits touch one page's
  // citations, not all of them). Computed once from the `initial` prop, which
  // is available synchronously at mount — NOT from live form state, which is
  // still blank at this point (the reset-from-initial effect below hasn't run
  // yet on the very first render).
  const legalValueMissingInitial = (fieldKey: string): boolean =>
    !initial ? false : !String((initial as unknown as Record<string, string | null | undefined>)[fieldKey] ?? "").trim();
  const [openLegalGroups, setOpenLegalGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      LEGAL_PAGE_GROUPS.map((g) => [
        g.key,
        isCreate ||
          g.blocks.some(
            (block) =>
              block.kind === "field" &&
              block.fieldNames.some(
                (f) => legalValueMissingInitial(f) || legalValueMissingInitial(`${f}_ar`)
              )
          ),
      ])
    )
  );
  const toggleLegalGroup = (key: string) =>
    setOpenLegalGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const isLegalGroupOpen = (group: LegalPageGroup): boolean => Boolean(openLegalGroups[group.key]);

  // The whole point of the picker: one search replaces four hand-typed,
  // typo-prone fields. Currency is only overwritten when we have a confident
  // default (see countries.ts) — otherwise the admin's existing value (or the
  // AED default) is left alone rather than being cleared to guess wrong.
  const applyCountry = (c: CountryOption) => {
    setValue("code", c.iso2.toUpperCase(), { shouldDirty: true, shouldValidate: true });
    setValue("name", c.nameEn, { shouldDirty: true, shouldValidate: true });
    setValue("name_ar", c.nameAr, { shouldDirty: true });
    setValue("iso2", c.iso2.toUpperCase(), { shouldDirty: true, shouldValidate: true });
    // Default the public-route slug to the lowercased ISO code (e.g. "ae"),
    // still fully editable afterwards — same convenience as the other fields.
    setValue("urlSlug", c.iso2.toLowerCase(), { shouldDirty: true, shouldValidate: true });
    if (c.currency) {
      setValue("currency", c.currency, { shouldDirty: true, shouldValidate: true });
    }
  };

  useEffect(() => {
    if (!initial) return;
    const legalFromInitial = Object.fromEntries(
      LEGAL_FIELD_BASE_NAMES.flatMap((f) => [
        [f, (initial[f as keyof ApiRegion] as string | null) ?? ""],
        [`${f}_ar`, (initial[`${f}_ar` as keyof ApiRegion] as string | null) ?? ""],
      ])
    ) as Partial<FormValues>;
    reset({
      code: initial.code,
      name: initial.name,
      name_ar: initial.name_ar ?? "",
      currency: initial.currency ?? "AED",
      legalEntity: initial.legalEntity ?? "",
      shippingFlatRate: initial.shippingFlatRate != null ? Number(initial.shippingFlatRate) : null,
      standardDeliveryDays: initial.standardDeliveryDays ?? null,
      timezone: initial.timezone || DEFAULT_TIMEZONE,
      freeDeliveryThreshold:
        initial.freeDeliveryThreshold != null ? Number(initial.freeDeliveryThreshold) : null,
      deliveryDays: initial.deliveryDays ?? [],
      sameDayEnabled: initial.sameDayEnabled ?? false,
      sameDayCutoff: initial.sameDayCutoff ?? "",
      codEnabled: initial.codEnabled ?? true,
      onlinePaymentEnabled: initial.onlinePaymentEnabled ?? false,
      blackoutDates: (initial.blackoutDates ?? []).map((b) => ({
        id: b.id,
        date: b.date,
        label: b.label ?? "",
        label_ar: b.label_ar ?? "",
      })),
      iso2: initial.iso2 ?? "",
      urlSlug: initial.urlSlug ?? "",
      contactEmail: initial.contactEmail ?? "",
      contactPhone: initial.contactPhone ?? "",
      whatsappNumber: initial.whatsappNumber ?? "",
      address: initial.address ?? "",
      address_ar: initial.address_ar ?? "",
      hours: initial.hours ?? "",
      hours_ar: initial.hours_ar ?? "",
      instagramUrl: initial.instagramUrl ?? "",
      facebookUrl: initial.facebookUrl ?? "",
      tiktokUrl: initial.tiktokUrl ?? "",
      threadsUrl: initial.threadsUrl ?? "",
      snapchatUrl: initial.snapchatUrl ?? "",
      xUrl: initial.xUrl ?? "",
      youtubeUrl: initial.youtubeUrl ?? "",
      ...legalFromInitial,
      sortOrder: initial.sortOrder,
      isDefault: initial.isDefault,
      isActive: initial.isActive,
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (v) => {
    // Create: Zod already guaranteed every legal field is non-empty, so this
    // is always a real string. Edit: send the trimmed value if the admin
    // typed one, otherwise omit the key entirely (leave whatever's already
    // there — there's no "clear this citation back to empty" action).
    const legalPayload = Object.fromEntries(
      LEGAL_FIELD_BASE_NAMES.flatMap((f) => {
        const en = (v as unknown as Record<string, string | undefined>)[f]?.trim();
        const ar = (v as unknown as Record<string, string | undefined>)[`${f}_ar`]?.trim();
        return [
          [f, en || (isCreate ? "" : undefined)],
          [`${f}_ar`, ar || (isCreate ? "" : undefined)],
        ];
      }).filter(([, value]) => value !== undefined)
    ) as Partial<ApiRegionCreateInput>;

    await onSubmit({
      code: v.code.trim().toUpperCase(),
      name: v.name.trim(),
      name_ar: v.name_ar?.trim() || null,
      currency: v.currency.trim().toUpperCase(),
      legalEntity: v.legalEntity?.trim() || null,
      shippingFlatRate: v.shippingFlatRate,
      standardDeliveryDays: v.standardDeliveryDays,
      timezone: v.timezone?.trim() || DEFAULT_TIMEZONE,
      freeDeliveryThreshold: v.freeDeliveryThreshold,
      deliveryDays: v.deliveryDays ?? [],
      sameDayEnabled: v.sameDayEnabled,
      sameDayCutoff: v.sameDayCutoff?.trim() ? v.sameDayCutoff.trim() : null,
      codEnabled: v.codEnabled,
      onlinePaymentEnabled: v.onlinePaymentEnabled,
      blackoutDates: (v.blackoutDates ?? [])
        .filter((b) => b.date?.trim())
        .map((b) => ({
          ...(b.id ? { id: b.id } : {}),
          date: b.date.trim(),
          label: b.label?.trim() || null,
          label_ar: b.label_ar?.trim() || null,
        })),
      iso2: v.iso2?.trim() ? v.iso2.trim().toUpperCase() : null,
      urlSlug: v.urlSlug?.trim() ? v.urlSlug.trim().toLowerCase() : null,
      contactEmail: v.contactEmail?.trim() || null,
      contactPhone: v.contactPhone?.trim() || null,
      whatsappNumber: v.whatsappNumber?.trim() || null,
      address: v.address?.trim() || null,
      address_ar: v.address_ar?.trim() || null,
      hours: v.hours?.trim() || null,
      hours_ar: v.hours_ar?.trim() || null,
      instagramUrl: v.instagramUrl?.trim() || null,
      facebookUrl: v.facebookUrl?.trim() || null,
      tiktokUrl: v.tiktokUrl?.trim() || null,
      threadsUrl: v.threadsUrl?.trim() || null,
      snapchatUrl: v.snapchatUrl?.trim() || null,
      xUrl: v.xUrl?.trim() || null,
      youtubeUrl: v.youtubeUrl?.trim() || null,
      ...legalPayload,
      sortOrder: v.sortOrder,
      isDefault: v.isDefault,
      isActive: v.isActive,
    } as Parameters<typeof onSubmit>[0]);
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.regionForm.detailsHeading")}</h3>
          <div className="mb-5">
            <CountryPicker onSelect={applyCountry} />
            <p className="mt-1.5 text-[11px] text-ink-400">
              {t("admin.regionForm.countryPickerHint")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.regionForm.codeLabel")}
              placeholder="UAE"
              hint={t("admin.regionForm.codeHint")}
              error={errors.code?.message}
              {...register("code")}
            />
            <Input
              label={t("admin.regionForm.sortOrderLabel")}
              type="number"
              step="1"
              min="0"
              hint={t("admin.regionForm.sortOrderHint")}
              error={errors.sortOrder?.message}
              {...register("sortOrder", { valueAsNumber: true })}
            />
            <Input
              label={t("admin.regionForm.nameEnLabel")}
              placeholder="United Arab Emirates"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label={t("admin.regionForm.nameArLabel")}
              dir="rtl"
              placeholder="الإمارات العربية المتحدة"
              {...register("name_ar")}
            />
            <Input
              label={t("admin.regionForm.currencyLabel")}
              placeholder="AED"
              hint={t("admin.regionForm.currencyHint")}
              error={errors.currency?.message}
              {...register("currency")}
            />
            <Input
              label={t("admin.regionForm.legalEntityLabel")}
              placeholder="AMOON BLOOM Trading L.L.C S.O.C™"
              hint={t("admin.regionForm.legalEntityHint")}
              error={errors.legalEntity?.message}
              containerClassName="sm:col-span-2"
              {...register("legalEntity")}
            />
            <Input
              label={t("admin.regionForm.shippingFlatRateLabel")}
              type="number"
              step="0.01"
              min="0"
              placeholder="25.00"
              hint={t("admin.regionForm.shippingFlatRateHint")}
              error={errors.shippingFlatRate?.message}
              {...register("shippingFlatRate", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
            <Input
              label={t("admin.regionForm.standardDeliveryDaysLabel")}
              type="number"
              step="1"
              min="0"
              placeholder="3"
              hint={t("admin.regionForm.standardDeliveryDaysHint")}
              error={errors.standardDeliveryDays?.message}
              {...register("standardDeliveryDays", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
            <div className="flex items-end gap-3">
              <Input
                label={t("admin.regionForm.iso2Label")}
                placeholder="AE"
                maxLength={2}
                hint={t("admin.regionForm.iso2Hint")}
                error={errors.iso2?.message}
                containerClassName="flex-1"
                {...register("iso2")}
              />
              <RegionFlag
                region={/^[A-Za-z]{2}$/.test(iso2Value ?? "") ? { iso2: iso2Value ?? null, name: "" } : undefined}
                shape="circle"
                className="mb-2.5 h-10 w-10"
              />
            </div>
            <Input
              label={t("admin.regionForm.urlSlugLabel")}
              placeholder="ae"
              hint={t("admin.regionForm.urlSlugHint")}
              error={errors.urlSlug?.message}
              {...register("urlSlug")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.regionForm.deliveryConfigHeading")}</h3>
          <p className="mb-4 text-xs text-ink-500">{t("admin.regionForm.deliveryConfigHint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="region-timezone"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700"
              >
                {t("admin.regionForm.timezoneLabel")}
              </label>
              <select
                id="region-timezone"
                className={NATIVE_CONTROL_CLASS}
                {...register("timezone")}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-xs text-ink-500">{t("admin.regionForm.timezoneHint")}</p>
            </div>
            <Input
              label={t("admin.regionForm.freeDeliveryThresholdLabel")}
              type="number"
              step="0.01"
              min="0"
              placeholder="200.00"
              hint={t("admin.regionForm.freeDeliveryThresholdHint")}
              error={errors.freeDeliveryThreshold?.message}
              {...register("freeDeliveryThreshold", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
              {t("admin.regionForm.deliveryDaysLabel")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAYS.map(({ day, labelKey }) => {
                const checked = selectedDeliveryDays.includes(day);
                return (
                  <label
                    key={day}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      checked
                        ? "border-bloom-500 bg-bloom-50 text-bloom-700"
                        : "border-ink-200 text-ink-700 hover:border-ink-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDeliveryDay(day)}
                      className="h-4 w-4 accent-bloom-600"
                    />
                    {t(`admin.regionForm.${labelKey}` as Parameters<typeof t>[0])}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-500">{t("admin.regionForm.deliveryDaysHint")}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("sameDayEnabled")}
                  className="h-5 w-5 accent-bloom-600"
                />
                <span className="text-sm text-ink-900">{t("admin.regionForm.sameDayEnabledLabel")}</span>
              </label>
              <p className="mt-1 text-xs text-ink-500">{t("admin.regionForm.sameDayEnabledHint")}</p>
              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("codEnabled")}
                  className="h-5 w-5 accent-bloom-600"
                />
                <span className="text-sm text-ink-900">{t("admin.regionForm.codEnabledLabel")}</span>
              </label>
              <p className="mt-1 text-xs text-ink-500">{t("admin.regionForm.codEnabledHint")}</p>
              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("onlinePaymentEnabled")}
                  className="h-5 w-5 accent-bloom-600"
                />
                <span className="text-sm text-ink-900">{t("admin.regionForm.onlinePaymentEnabledLabel")}</span>
              </label>
              <p className="mt-1 text-xs text-ink-500">{t("admin.regionForm.onlinePaymentEnabledHint")}</p>
            </div>
            <Input
              label={t("admin.regionForm.sameDayCutoffLabel")}
              type="time"
              disabled={!sameDayEnabled}
              hint={t("admin.regionForm.sameDayCutoffHint")}
              error={errors.sameDayCutoff?.message}
              {...register("sameDayCutoff")}
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
              {t("admin.regionForm.blackoutDatesLabel")}
            </p>
            <p className="mt-1 mb-3 text-xs text-ink-500">{t("admin.regionForm.blackoutDatesHint")}</p>
            {blackoutFields.length === 0 ? (
              <p className="mb-3 text-sm text-ink-400">{t("admin.regionForm.blackoutEmpty")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {blackoutFields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="date"
                      aria-label={t("admin.regionForm.blackoutDateLabel")}
                      className={cn(NATIVE_CONTROL_CLASS, "w-auto shrink-0")}
                      {...register(`blackoutDates.${i}.date`)}
                    />
                    <input
                      className={NATIVE_CONTROL_CLASS}
                      placeholder={t("admin.regionForm.blackoutLabelPlaceholder")}
                      {...register(`blackoutDates.${i}.label`)}
                    />
                    <input
                      className={NATIVE_CONTROL_CLASS}
                      dir="rtl"
                      placeholder={t("admin.regionForm.blackoutLabelArPlaceholder")}
                      {...register(`blackoutDates.${i}.label_ar`)}
                    />
                    <button
                      type="button"
                      onClick={() => removeBlackout(i)}
                      aria-label={t("admin.regionForm.blackoutRemoveRow")}
                      className="shrink-0 rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => appendBlackout({ date: "", label: "", label_ar: "" })}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-bloom-700 hover:text-bloom-800"
            >
              <PlusIcon size={16} /> {t("admin.regionForm.blackoutAddRow")}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.regionForm.contactHeading")}</h3>
          <p className="mb-4 text-xs text-ink-500">{t("admin.regionForm.contactHint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.regionForm.contactEmailLabel")}
              type="email"
              placeholder="support@amoonbloom.com"
              error={errors.contactEmail?.message}
              {...register("contactEmail")}
            />
            <Input
              label={t("admin.regionForm.contactPhoneLabel")}
              placeholder="+971 50 606 7910"
              {...register("contactPhone")}
            />
            <Input
              label={t("admin.regionForm.whatsappNumberLabel")}
              placeholder="+971 50 606 7910"
              hint={t("admin.regionForm.whatsappNumberHint")}
              containerClassName="sm:col-span-2"
              {...register("whatsappNumber")}
            />
            <Input
              label={t("admin.regionForm.addressLabel")}
              placeholder="Dubai, United Arab Emirates"
              {...register("address")}
            />
            <Input
              label={t("admin.regionForm.addressArLabel")}
              dir="rtl"
              placeholder="دبي، الإمارات العربية المتحدة"
              {...register("address_ar")}
            />
            <Input
              label={t("admin.regionForm.hoursLabel")}
              placeholder="Daily · 10:00 — 00:00 (Dubai time)"
              {...register("hours")}
            />
            <Input
              label={t("admin.regionForm.hoursArLabel")}
              dir="rtl"
              placeholder="يوميا · 10:00 — 00:00 بتوقيت دبي"
              {...register("hours_ar")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.regionForm.socialHeading")}</h3>
          <p className="mb-4 text-xs text-ink-500">{t("admin.regionForm.socialHint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Instagram" placeholder="https://instagram.com/…" {...register("instagramUrl")} />
            <Input label="Facebook" placeholder="https://facebook.com/…" {...register("facebookUrl")} />
            <Input label="TikTok" placeholder="https://tiktok.com/@…" {...register("tiktokUrl")} />
            <Input label="Threads" placeholder="https://threads.com/@…" {...register("threadsUrl")} />
            <Input label="Snapchat" placeholder="https://snapchat.com/add/…" {...register("snapchatUrl")} />
            <Input label="X (Twitter)" placeholder="https://x.com/…" {...register("xUrl")} />
            <Input label="YouTube" placeholder="https://youtube.com/@…" {...register("youtubeUrl")} />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.regionForm.legalHeading")}</h3>
          <p className="mb-4 text-xs text-ink-500">
            {isCreate ? t("admin.regionForm.legalHintCreate") : t("admin.regionForm.legalHintEdit")}
          </p>
          <div className="flex flex-col gap-3">
            {LEGAL_PAGE_GROUPS.map((group) => {
              const open = isLegalGroupOpen(group);
              return (
                <div key={group.key} className="overflow-hidden rounded-2xl border border-ink-100">
                  <button
                    type="button"
                    onClick={() => toggleLegalGroup(group.key)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 bg-cream-50 px-4 py-3 text-start"
                  >
                    <span className="font-display text-base text-ink-900">
                      {t(`admin.regionForm.${group.pageNameKey}` as Parameters<typeof t>[0])}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "shrink-0 text-ink-500 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open ? (
                    <div className="flex flex-col gap-4 p-4">
                      {group.blocks.map((block, i) => {
                        let example = locale === "ar" ? block.exampleAr : block.example;
                        // The VAT clause forks by this region's real VatConfig (a setting
                        // from a different admin page), so its preview can't be a static
                        // example — compute it live via the same functions the storefront
                        // pages call, using the currently-typed currency/law values (falling
                        // back to the field placeholders when blank) so the highlighted
                        // terms below always match exactly what's shown. `regionVatConfig`
                        // is never null — it's this region's real config once loaded, or the
                        // exclusive default (DEFAULT_PREVIEW_VAT) before that/in create mode.
                        let dynamicTerms: string[] = [];
                        if (block.kind !== "footer" && block.dynamicExample) {
                          const currencyValue =
                            (locale === "ar" ? allValues.currencyDisplayName_ar : allValues.currencyDisplayName)?.trim() ||
                            (locale === "ar"
                              ? LEGAL_FIELD_META.currencyDisplayName.arPlaceholder
                              : LEGAL_FIELD_META.currencyDisplayName.placeholder);
                          const vatLawValue =
                            (locale === "ar" ? allValues.vatLawName_ar : allValues.vatLawName)?.trim() ||
                            (locale === "ar"
                              ? LEGAL_FIELD_META.vatLawName.arPlaceholder
                              : LEGAL_FIELD_META.vatLawName.placeholder);
                          dynamicTerms = [currencyValue, vatLawValue];
                          const buildClause = block.dynamicExample === "terms" ? termsVatClause : shippingVatClause;
                          const [dynEn, dynAr] = buildClause(regionVatConfig, currencyValue, vatLawValue);
                          example = locale === "ar" ? dynAr : dynEn;
                        }
                        if (block.kind === "footer") {
                          // The footer's only region-specific word is the country,
                          // which the storefront fills from this region's Name field.
                          const footerTerm =
                            locale === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates";
                          return (
                            <div
                              key={i}
                              className="rounded-xl border border-dashed border-ink-200 bg-cream-50/60 p-4"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                                {t("admin.regionForm.legalExampleLabel")}
                              </p>
                              <p className="mt-1 text-sm italic text-ink-600">
                                &ldquo;{highlightExample(example, [footerTerm])}&rdquo;
                              </p>
                              <p className="mt-2 text-xs text-bloom-700">
                                {t("admin.regionForm.legalFooterNote")}
                              </p>
                            </div>
                          );
                        }
                        if (block.kind === "reference") {
                          const sourceGroup = LEGAL_PAGE_GROUPS.find(
                            (g) => g.key === block.referencesGroupKey
                          );
                          const clauseTitle = locale === "ar" ? block.clauseTitleAr : block.clauseTitle;
                          const refTerms = block.dynamicExample
                            ? dynamicTerms
                            : block.fieldNames.map((fn) =>
                                locale === "ar" ? LEGAL_FIELD_META[fn].arPlaceholder : LEGAL_FIELD_META[fn].placeholder
                              );
                          return (
                            <div
                              key={i}
                              className="rounded-xl border border-dashed border-ink-200 bg-cream-50/60 p-4"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-bloom-700">
                                {clauseTitle}
                              </p>
                              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                                {t("admin.regionForm.legalExampleLabel")}
                              </p>
                              <p className="mt-1 text-sm italic text-ink-600">
                                &ldquo;{highlightExample(example, [...refTerms, ...LEGAL_ENTITY_EXAMPLE_TERMS])}&rdquo;
                              </p>
                              <p className="mt-2 text-xs text-bloom-700">
                                {sourceGroup
                                  ? t("admin.regionForm.legalSeeAbove", {
                                      page: t(
                                        `admin.regionForm.${sourceGroup.pageNameKey}` as Parameters<typeof t>[0]
                                      ),
                                    })
                                  : null}
                              </p>
                            </div>
                          );
                        }
                        const clauseTitle = locale === "ar" ? block.clauseTitleAr : block.clauseTitle;
                        const fieldTerms = block.dynamicExample
                          ? dynamicTerms
                          : block.fieldNames.map((fn) =>
                              locale === "ar"
                                ? LEGAL_FIELD_META[fn].arPlaceholder
                                : LEGAL_FIELD_META[fn].placeholder
                            );
                        return (
                          <div key={i} className="rounded-xl border border-ink-100 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-bloom-700">
                              {clauseTitle}
                            </p>
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                              {t("admin.regionForm.legalExampleLabel")}
                            </p>
                            <p className="mt-1 text-sm italic text-ink-600">
                              &ldquo;{highlightExample(example, [...fieldTerms, ...LEGAL_ENTITY_EXAMPLE_TERMS])}&rdquo;
                            </p>
                            {block.alsoUsedIn ? (
                              <p className="mt-1.5 text-[11px] text-ink-400">
                                {t("admin.regionForm.legalAlsoUsedIn", { clause: block.alsoUsedIn })}
                              </p>
                            ) : null}
                            {block.dynamicExample === "terms" ? (
                              <div className="mt-3 rounded-lg border border-ink-100 bg-cream-50/60 p-3">
                                {isCreate ? (
                                  <p className="text-xs text-ink-500">
                                    {t("admin.regionForm.vatTreatmentCreateHint")}
                                  </p>
                                ) : !vatTreatmentIsEditable ? (
                                  <p className="text-xs text-ink-500">
                                    {t("admin.regionForm.vatTreatmentDisabledHint")}{" "}
                                    <Link
                                      href="/admin/tax"
                                      className="font-medium text-bloom-700 hover:underline"
                                    >
                                      {t("admin.regionForm.vatTreatmentGoToTax")}
                                    </Link>
                                  </p>
                                ) : (
                                  <>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
                                      {t("admin.regionForm.vatTreatmentLabel")}
                                    </label>
                                    <Select
                                      value={regionVatConfig.inclusive ? "inclusive" : "exclusive"}
                                      onChange={(v) => vatInclusiveMutation.mutate(v === "inclusive")}
                                      aria-label={t("admin.regionForm.vatTreatmentLabel")}
                                      options={[
                                        { value: "exclusive", label: t("admin.regionForm.vatExclusive") },
                                        { value: "inclusive", label: t("admin.regionForm.vatInclusive") },
                                      ]}
                                    />
                                    <p className="mt-1.5 text-xs text-ink-500">
                                      {t("admin.regionForm.vatTreatmentHint")}
                                    </p>
                                  </>
                                )}
                              </div>
                            ) : null}
                            <div className="mt-3 flex flex-col gap-4">
                              {block.fieldNames.map((fieldName) => {
                                const meta = LEGAL_FIELD_META[fieldName];
                                return (
                                  <div key={fieldName} className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                      label={t(`admin.regionForm.${meta.labelKey}` as Parameters<typeof t>[0])}
                                      placeholder={meta.placeholder}
                                      hint={
                                        meta.hintKey
                                          ? t(`admin.regionForm.${meta.hintKey}` as Parameters<typeof t>[0])
                                          : undefined
                                      }
                                      error={
                                        (errors as Record<string, { message?: string } | undefined>)[meta.name]
                                          ?.message ?? legalNeedsReview(meta.name)
                                      }
                                      {...register(meta.name)}
                                    />
                                    <Input
                                      label={t(`admin.regionForm.${meta.arLabelKey}` as Parameters<typeof t>[0])}
                                      dir="rtl"
                                      placeholder={meta.arPlaceholder}
                                      error={
                                        (errors as Record<string, { message?: string } | undefined>)[
                                          `${meta.name}_ar`
                                        ]?.message ?? legalNeedsReview(`${meta.name}_ar`)
                                      }
                                      {...register(`${meta.name}_ar` as "registrationCity_ar")}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.regionForm.visibilityHeading")}</h3>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.regionForm.activeLabel")}</span>
          </label>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.regionForm.defaultLabel")}</span>
          </label>
          <p className="mt-3 text-xs text-ink-500">
            {t("admin.regionForm.defaultHint")}
          </p>
        </section>
      </aside>

      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit" size="lg" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
