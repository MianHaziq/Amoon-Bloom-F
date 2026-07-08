"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Textarea } from "@/components/ui";
import { RegionPicker } from "@/components/admin/RegionPicker";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import { useT } from "@/i18n/useT";
import type {
  ApiPromoCode,
  ApiPromoCodeCreateInput,
} from "@/features/promo-codes/types";

interface PromoCodeFormProps {
  initial?: ApiPromoCode;
  onSubmit: (payload: ApiPromoCodeCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

const toIsoLocal = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Convert to YYYY-MM-DDTHH:mm in local time for datetime-local input.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export function PromoCodeForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
}: PromoCodeFormProps) {
  const { t } = useT();
  const schema = useMemo(
    () =>
      z.object({
        code: z.string().min(2, t("admin.promoCodeForm.codeMin")).max(40),
        name: z.string().min(1, t("admin.promoCodeForm.nameRequired")),
        name_ar: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        description_ar: z.string().optional().nullable(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discountValue: z.number().nonnegative(t("admin.promoCodeForm.discountValueMin")),
        maxDiscountAmount: z.number().nonnegative().nullable(),
        appliesTo: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"]),
        productIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
        minOrderAmount: z.number().nonnegative().nullable(),
        maxOrderAmount: z.number().nonnegative().nullable(),
        startsAt: z.string().optional().nullable(),
        expiresAt: z.string().optional().nullable(),
        usageLimit: z.number().int().positive().nullable(),
        usageLimitPerUser: z.number().int().positive().nullable(),
        newUsersOnly: z.boolean(),
        newUserWithinDays: z.number().int().positive().nullable(),
        isActive: z.boolean(),
        regionIds: z.array(z.string()),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 100 }),
    queryFn: () => productsApi.list({ limit: 100 }),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscountAmount: null,
      appliesTo: "ALL_PRODUCTS",
      productIds: [],
      categoryIds: [],
      minOrderAmount: null,
      maxOrderAmount: null,
      startsAt: "",
      expiresAt: "",
      usageLimit: null,
      usageLimitPerUser: null,
      newUsersOnly: false,
      newUserWithinDays: null,
      isActive: true,
      regionIds: [],
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      code: initial.code,
      name: initial.name,
      name_ar: initial.name_ar ?? "",
      description: initial.description ?? "",
      description_ar: initial.description_ar ?? "",
      discountType: initial.discountType,
      discountValue: initial.discountValue,
      maxDiscountAmount: initial.maxDiscountAmount,
      appliesTo: initial.appliesTo,
      productIds: initial.productIds ?? [],
      categoryIds: initial.categoryIds ?? [],
      minOrderAmount: initial.minOrderAmount,
      maxOrderAmount: initial.maxOrderAmount,
      startsAt: toIsoLocal(initial.startsAt),
      expiresAt: toIsoLocal(initial.expiresAt),
      usageLimit: initial.usageLimit,
      usageLimitPerUser: initial.usageLimitPerUser,
      newUsersOnly: initial.newUsersOnly ?? false,
      newUserWithinDays: initial.newUserWithinDays ?? null,
      isActive: initial.isActive,
      regionIds: initial.regionIds ?? [],
    });
  }, [initial, reset]);

  const appliesTo = watch("appliesTo");
  const discountType = watch("discountType");
  const productIds = watch("productIds");
  const categoryIds = watch("categoryIds");
  const newUsersOnly = watch("newUsersOnly");

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      code: v.code.trim().toUpperCase(),
      name: v.name.trim(),
      name_ar: v.name_ar?.trim() || null,
      description: v.description?.trim() || null,
      description_ar: v.description_ar?.trim() || null,
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscountAmount: v.maxDiscountAmount,
      appliesTo: v.appliesTo,
      productIds: v.appliesTo === "SPECIFIC_PRODUCTS" ? v.productIds : undefined,
      categoryIds: v.appliesTo === "SPECIFIC_CATEGORIES" ? v.categoryIds : undefined,
      minOrderAmount: v.minOrderAmount,
      maxOrderAmount: v.maxOrderAmount,
      startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
      expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : null,
      usageLimit: v.usageLimit,
      usageLimitPerUser: v.usageLimitPerUser,
      newUsersOnly: v.newUsersOnly,
      // Backend wants the account-age window only when the flag is on.
      newUserWithinDays: v.newUsersOnly ? v.newUserWithinDays ?? 30 : null,
      isActive: v.isActive,
      regionIds: v.regionIds,
    });
  });

  const toggleId = (list: string[], id: string, key: "productIds" | "categoryIds") => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setValue(key, next, { shouldDirty: true });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.basicsHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.promoCodeForm.codeLabel")}
              placeholder="WELCOME10"
              error={errors.code?.message}
              {...register("code")}
            />
            <Input
              label={t("admin.promoCodeForm.displayNameLabel")}
              placeholder="Welcome 10%"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label={t("admin.promoCodeForm.displayNameArLabel")}
              dir="rtl"
              {...register("name_ar")}
            />
            <div className="hidden sm:block" /> {/* spacer */}
            <Textarea
              label={t("admin.promoCodeForm.descriptionEnLabel")}
              rows={2}
              containerClassName="sm:col-span-2"
              {...register("description")}
            />
            <Textarea
              label={t("admin.promoCodeForm.descriptionArLabel")}
              rows={2}
              dir="rtl"
              containerClassName="sm:col-span-2"
              {...register("description_ar")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.discountHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                {t("admin.promoCodeForm.typeLabel")}
              </label>
              <select
                {...register("discountType")}
                className="block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
              >
                <option value="PERCENTAGE">{t("admin.promoCodeForm.typePercentage")}</option>
                <option value="FIXED">{t("admin.promoCodeForm.typeFixed")}</option>
              </select>
            </div>
            <Input
              label={
                discountType === "PERCENTAGE"
                  ? t("admin.promoCodeForm.percentOffLabel")
                  : t("admin.promoCodeForm.amountOffLabel")
              }
              type="number"
              step={discountType === "PERCENTAGE" ? "1" : "0.01"}
              min="0"
              error={errors.discountValue?.message}
              {...register("discountValue", { valueAsNumber: true })}
            />
            <Input
              label={t("admin.promoCodeForm.maxDiscountCapLabel")}
              type="number"
              step="0.01"
              min="0"
              hint={t("admin.promoCodeForm.maxDiscountCapHint")}
              {...register("maxDiscountAmount", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.scopeHeading")}</h3>
          <select
            {...register("appliesTo")}
            className="mb-4 block w-full rounded-2xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-4 focus:ring-bloom-100"
          >
            <option value="ALL_PRODUCTS">{t("admin.promoCodeForm.scopeAllProducts")}</option>
            <option value="SPECIFIC_PRODUCTS">{t("admin.promoCodeForm.scopeSpecificProducts")}</option>
            <option value="SPECIFIC_CATEGORIES">{t("admin.promoCodeForm.scopeSpecificCategories")}</option>
          </select>

          {appliesTo === "SPECIFIC_PRODUCTS" ? (
            <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
              {productsQuery.data?.data.map((p) => {
                const checked = productIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " +
                      (checked ? "bg-bloom-100 text-bloom-800" : "hover:bg-cream-100")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(productIds, p.id, "productIds")}
                      className="shrink-0 accent-bloom-600"
                    />
                    <span className="min-w-0 truncate">{p.title}</span>
                  </label>
                );
              })}
            </div>
          ) : null}

          {appliesTo === "SPECIFIC_CATEGORIES" ? (
            <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
              {categoriesQuery.data?.map((c) => {
                const checked = categoryIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors " +
                      (checked ? "bg-bloom-100 text-bloom-800" : "hover:bg-cream-100")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(categoryIds, c.id, "categoryIds")}
                      className="shrink-0 accent-bloom-600"
                    />
                    <span className="min-w-0 truncate">{c.title}</span>
                  </label>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.statusHeading")}</h3>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.promoCodeForm.codeActiveLabel")}</span>
          </label>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Regions</h3>
          <Controller
            control={control}
            name="regionIds"
            render={({ field }) => (
              <RegionPicker selectedIds={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.windowHeading")}</h3>
          <Input
            label={t("admin.promoCodeForm.startsLabel")}
            type="datetime-local"
            {...register("startsAt")}
          />
          <Input
            label={t("admin.promoCodeForm.expiresLabel")}
            type="datetime-local"
            containerClassName="mt-3"
            {...register("expiresAt")}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.limitsHeading")}</h3>
          <Input
            label={t("admin.promoCodeForm.minOrderAmountLabel")}
            type="number"
            step="0.01"
            min="0"
            {...register("minOrderAmount", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
          <Input
            label={t("admin.promoCodeForm.maxOrderAmountLabel")}
            type="number"
            step="0.01"
            min="0"
            containerClassName="mt-3"
            {...register("maxOrderAmount", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
          <Input
            label={t("admin.promoCodeForm.totalUsesLabel")}
            type="number"
            step="1"
            min="0"
            hint={t("admin.promoCodeForm.totalUsesHint")}
            containerClassName="mt-3"
            {...register("usageLimit", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
          <Input
            label={t("admin.promoCodeForm.perCustomerLimitLabel")}
            type="number"
            step="1"
            min="0"
            containerClassName="mt-3"
            {...register("usageLimitPerUser", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.promoCodeForm.eligibilityHeading")}</h3>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("newUsersOnly")}
              className="h-5 w-5 accent-bloom-600"
            />
            <span className="text-sm text-ink-900">{t("admin.promoCodeForm.newCustomersOnlyLabel")}</span>
          </label>
          {newUsersOnly ? (
            <Input
              label={t("admin.promoCodeForm.accountAgeWindowLabel")}
              type="number"
              step="1"
              min="1"
              hint={t("admin.promoCodeForm.accountAgeWindowHint")}
              containerClassName="mt-3"
              {...register("newUserWithinDays", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
            />
          ) : null}
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
