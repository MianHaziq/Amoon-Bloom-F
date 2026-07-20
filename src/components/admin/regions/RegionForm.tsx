"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { RegionFlag } from "@/features/location/components/RegionFlag";
import { CountryPicker } from "./CountryPicker";
import { useT } from "@/i18n/useT";
import type { ApiRegion, ApiRegionCreateInput } from "@/features/regions/types";
import type { CountryOption } from "@/features/regions/countries";

interface RegionFormProps {
  initial?: ApiRegion;
  onSubmit: (payload: ApiRegionCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

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

interface LegalFieldMeta {
  name: (typeof LEGAL_FIELD_BASE_NAMES)[number];
  labelKey: string;
  arLabelKey: string;
  placeholder: string;
  arPlaceholder: string;
  hintKey?: string;
  wide?: boolean;
}

// Placeholders are UAE's own real, verified citations (not invented examples
// for a hypothetical country) — they illustrate the expected specificity
// without ever reading as a suggested value for whichever region is actually
// being created.
const LEGAL_FIELD_META: LegalFieldMeta[] = [
  {
    name: "registrationCity",
    labelKey: "registrationCityLabel",
    arLabelKey: "registrationCityArLabel",
    placeholder: "Dubai",
    arPlaceholder: "دبي",
    hintKey: "registrationCityHint",
  },
  {
    name: "currencyDisplayName",
    labelKey: "currencyDisplayNameLabel",
    arLabelKey: "currencyDisplayNameArLabel",
    placeholder: "UAE Dirhams (AED)",
    arPlaceholder: "الدرهم الإماراتي",
  },
  {
    name: "vatLawName",
    labelKey: "vatLawNameLabel",
    arLabelKey: "vatLawNameArLabel",
    placeholder: "UAE Federal Decree-Law on Value Added Tax",
    arPlaceholder: "المرسوم بقانون اتحادي بشأن ضريبة القيمة المضافة",
  },
  {
    name: "dataProtectionLawName",
    labelKey: "dataProtectionLawNameLabel",
    arLabelKey: "dataProtectionLawNameArLabel",
    placeholder: "UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)",
    arPlaceholder: "المرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية (PDPL)",
    wide: true,
  },
  {
    name: "dataProtectionAuthority",
    labelKey: "dataProtectionAuthorityLabel",
    arLabelKey: "dataProtectionAuthorityArLabel",
    placeholder: "UAE Data Office",
    arPlaceholder: "مكتب البيانات الإماراتي",
  },
  {
    name: "ipLawName",
    labelKey: "ipLawNameLabel",
    arLabelKey: "ipLawNameArLabel",
    placeholder: "UAE Federal Law No. 38 of 2021 on Intellectual Property Rights",
    arPlaceholder: "القانون الاتحادي رقم 38 لسنة 2021 بشأن الحقوق المعنوية",
    wide: true,
  },
  {
    name: "consumerProtectionLawName",
    labelKey: "consumerProtectionLawNameLabel",
    arLabelKey: "consumerProtectionLawNameArLabel",
    placeholder: "UAE Federal Law No. 15 of 2020 on Consumer Protection",
    arPlaceholder: "القانون الاتحادي الإماراتي رقم 15 لسنة 2020 بشأن حماية المستهلك",
    wide: true,
  },
  {
    name: "consumerProtectionAuthority",
    labelKey: "consumerProtectionAuthorityLabel",
    arLabelKey: "consumerProtectionAuthorityArLabel",
    placeholder: "UAE Ministry of Economy Consumer Protection Department",
    arPlaceholder: "إدارة حماية المستهلك في وزارة الاقتصاد الإماراتية",
  },
  {
    name: "standardsAuthority",
    labelKey: "standardsAuthorityLabel",
    arLabelKey: "standardsAuthorityArLabel",
    placeholder: "Emirates Authority for Standardisation and Metrology (ESMA)",
    arPlaceholder: "هيئة الإمارات للمواصفات والمقاييس (ESMA)",
  },
];

export function RegionForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
}: RegionFormProps) {
  const { t } = useT();
  // No explicit `mode` prop (unlike UserForm) — RegionForm has always inferred
  // create vs. edit from whether `initial` is present, and every caller
  // already relies on that.
  const isCreate = !initial;

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
      iso2: z
        .string()
        .refine((v) => v === "" || /^[A-Za-z]{2}$/.test(v), t("admin.regionForm.iso2Invalid"))
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
      sortOrder: z
        .number()
        .int(t("admin.regionForm.sortOrderWhole"))
        .min(0, t("admin.regionForm.sortOrderMin")),
      isDefault: z.boolean(),
      isActive: z.boolean(),
    });

    // 18 required string fields for create — a region cannot be created
    // without every legal citation filled in (see region.service.js's
    // matching server-side check, the real enforcement; this is the UX gate).
    // Cast to a Record keyed by the literal field-name UNION (not `string`) —
    // a plain `Record<string, ...>` makes Zod's `.extend()` infer an index
    // signature, which then poisons every OTHER field on the schema (code,
    // sortOrder, isDefault, ...) into being typed as this field's type too.
    type LegalKey = (typeof LEGAL_FIELD_BASE_NAMES)[number] | `${(typeof LEGAL_FIELD_BASE_NAMES)[number]}_ar`;
    const requiredLegalShape = Object.fromEntries(
      LEGAL_FIELD_BASE_NAMES.flatMap((f) => [
        [f, z.string().min(1, t("admin.regionForm.legalFieldRequired"))],
        [`${f}_ar`, z.string().min(1, t("admin.regionForm.legalFieldRequired"))],
      ])
    ) as Record<LegalKey, z.ZodString>;
    // Same 18 fields, optional — for editing a region that predates this
    // requirement (e.g. Saudi Arabia, Morocco) without blocking unrelated edits.
    const optionalLegalShape = Object.fromEntries(
      LEGAL_FIELD_BASE_NAMES.flatMap((f) => [
        [f, z.string().optional()],
        [`${f}_ar`, z.string().optional()],
      ])
    ) as Record<LegalKey, z.ZodOptional<z.ZodString>>;

    return {
      createSchema: base.extend(requiredLegalShape),
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
      iso2: "",
      contactEmail: "",
      contactPhone: "",
      whatsappNumber: "",
      address: "",
      address_ar: "",
      hours: "",
      hours_ar: "",
      ...legalDefaults,
      sortOrder: 0,
      isDefault: false,
      isActive: true,
    },
  });

  const iso2Value = watch("iso2");
  const allValues = watch();

  // Only meaningful in edit mode — a create-mode field can never be empty at
  // this point (Zod already blocked submission). Flags a field left over from
  // before this requirement existed (Saudi Arabia, Morocco) so it's obvious,
  // not just a blank input indistinguishable from any other optional field.
  const legalNeedsReview = (field: string): string | undefined =>
    !isCreate && !String((allValues as unknown as Record<string, string | undefined>)[field] ?? "").trim()
      ? t("admin.regionForm.legalFieldNeedsReview")
      : undefined;

  // The whole point of the picker: one search replaces four hand-typed,
  // typo-prone fields. Currency is only overwritten when we have a confident
  // default (see countries.ts) — otherwise the admin's existing value (or the
  // AED default) is left alone rather than being cleared to guess wrong.
  const applyCountry = (c: CountryOption) => {
    setValue("code", c.iso2.toUpperCase(), { shouldDirty: true, shouldValidate: true });
    setValue("name", c.nameEn, { shouldDirty: true, shouldValidate: true });
    setValue("name_ar", c.nameAr, { shouldDirty: true });
    setValue("iso2", c.iso2.toUpperCase(), { shouldDirty: true, shouldValidate: true });
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
      iso2: initial.iso2 ?? "",
      contactEmail: initial.contactEmail ?? "",
      contactPhone: initial.contactPhone ?? "",
      whatsappNumber: initial.whatsappNumber ?? "",
      address: initial.address ?? "",
      address_ar: initial.address_ar ?? "",
      hours: initial.hours ?? "",
      hours_ar: initial.hours_ar ?? "",
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
      iso2: v.iso2?.trim() ? v.iso2.trim().toUpperCase() : null,
      contactEmail: v.contactEmail?.trim() || null,
      contactPhone: v.contactPhone?.trim() || null,
      whatsappNumber: v.whatsappNumber?.trim() || null,
      address: v.address?.trim() || null,
      address_ar: v.address_ar?.trim() || null,
      hours: v.hours?.trim() || null,
      hours_ar: v.hours_ar?.trim() || null,
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
              placeholder="يوميًا · 10:00 — 00:00 بتوقيت دبي"
              {...register("hours_ar")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.regionForm.legalHeading")}</h3>
          <p className="mb-4 text-xs text-ink-500">
            {isCreate ? t("admin.regionForm.legalHintCreate") : t("admin.regionForm.legalHintEdit")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {LEGAL_FIELD_META.map((field) => (
              <div key={field.name} className={field.wide ? "sm:col-span-2 grid gap-4 sm:grid-cols-2" : "contents"}>
                <Input
                  label={t(`admin.regionForm.${field.labelKey}` as Parameters<typeof t>[0])}
                  placeholder={field.placeholder}
                  hint={field.hintKey ? t(`admin.regionForm.${field.hintKey}` as Parameters<typeof t>[0]) : undefined}
                  error={
                    (errors as Record<string, { message?: string } | undefined>)[field.name]?.message ??
                    legalNeedsReview(field.name)
                  }
                  {...register(field.name)}
                />
                <Input
                  label={t(`admin.regionForm.${field.arLabelKey}` as Parameters<typeof t>[0])}
                  dir="rtl"
                  placeholder={field.arPlaceholder}
                  error={
                    (errors as Record<string, { message?: string } | undefined>)[`${field.name}_ar`]?.message ??
                    legalNeedsReview(`${field.name}_ar`)
                  }
                  {...register(`${field.name}_ar` as "registrationCity_ar")}
                />
              </div>
            ))}
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
