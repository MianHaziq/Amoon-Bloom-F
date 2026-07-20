"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  Controller,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RegionPicker } from "@/components/admin/RegionPicker";
import { Select } from "@/components/admin/Select";
import { SortableList, SortableItem } from "@/components/admin/Sortable";
import {
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
  ChevronDown,
  CloseIcon,
} from "@/components/icons";
import { isColorGroupTitle, swatchForValue } from "@/features/products/facets";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/useT";
import type {
  ApiProduct,
  ApiProductCreateInput,
} from "@/features/products/api-types";

function useProductFormSchema() {
  const { t } = useT();
  return useMemo(() => {
    const descriptionSchema = z.object({
      title: z.string().optional().nullable(),
      title_ar: z.string().optional().nullable(),
      description: z.string().min(1, t("admin.productForm.descriptionRequired")),
      description_ar: z.string().optional().nullable(),
    });

    const optionSchema = z.object({
      title: z.string().min(1, t("admin.productForm.optionTitleRequired")),
      title_ar: z.string().optional().nullable(),
      options: z.array(z.string()).min(1, t("admin.productForm.optionValuesRequired")),
      options_ar: z.array(z.string()).optional(),
      // Optional per-choice image URLs (first photo of each set), aligned with `options`.
      optionImages: z.array(z.string()).optional(),
      // Optional per-choice swatch colours (hex), aligned by index with `options`.
      optionColors: z.array(z.string()).optional(),
      // Optional per-choice image SETS (several photos per value), aligned with `options`.
      optionImageSets: z.array(z.array(z.string())).optional(),
    });

    return z.object({
      title: z.string().min(1, t("admin.productForm.productTitleRequired")),
      title_ar: z.string().optional().nullable(),
      subtitle: z.string().optional().nullable(),
      subtitle_ar: z.string().optional().nullable(),
      price: z
        .number({ message: t("admin.productForm.priceInvalid") })
        .nonnegative(t("admin.productForm.priceMin")),
      discountedPrice: z.number().nonnegative(t("admin.productForm.discountMin")).nullable(),
      // Per-region manual price overrides, keyed by regionId — no auto FX, admin
      // enters each region's price explicitly. One row rendered per active
      // non-default region (see overrideRegions below).
      regionPrices: z.record(
        z.string(),
        z.object({
          price: z.number().nonnegative().nullable(),
          discountedPrice: z.number().nonnegative().nullable(),
        })
      ),
      // Gift card add-on — free personalized message, toggled per product.
      giftCardEnabled: z.boolean(),
      giftCardExtraPrice: z.number().nonnegative().nullable(),
      // Custom name add-on — customer types a name at add-to-cart time for this fee.
      customNameEnabled: z.boolean(),
      customNamePrice: z.number().nonnegative().nullable(),
      quantity: z
        .number()
        .int(t("admin.productForm.quantityWhole"))
        .nonnegative(t("admin.productForm.quantityMin")),
      categoryId: z.string().optional().nullable(),
      status: z.enum(["DRAFT", "PUBLISHED"]),
      regionIds: z.array(z.string()),
      images: z.array(z.string().url()).max(10, t("admin.productForm.imagesMax")),
      descriptions: z.array(descriptionSchema),
      productOptions: z.array(optionSchema),
    });
  }, [t]);
}

export type ProductFormValues = z.infer<ReturnType<typeof useProductFormSchema>>;

interface ProductFormProps {
  initial?: ApiProduct;
  onSubmit: (payload: ApiProductCreateInput) => Promise<void>;
  submitting?: boolean;
  submitLabel: string;
}

const emptyDefaults: ProductFormValues = {
  title: "",
  title_ar: "",
  subtitle: "",
  subtitle_ar: "",
  price: 0,
  discountedPrice: null,
  regionPrices: {},
  giftCardEnabled: false,
  giftCardExtraPrice: null,
  customNameEnabled: false,
  customNamePrice: null,
  quantity: 0,
  categoryId: null,
  status: "PUBLISHED",
  regionIds: [],
  images: [],
  descriptions: [],
  productOptions: [],
};

export function ProductForm({ initial, onSubmit, submitting, submitLabel }: ProductFormProps) {
  const { t } = useT();
  const productFormSchema = useProductFormSchema();
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });
  // Same query key as RegionPicker below — shares its cache entry, no extra request.
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });
  // Every non-default active region gets its own price-override row, unconditionally
  // (not gated on the Regions visibility checkboxes) — matches the old fixed SAR
  // section's behavior, now extended to every region instead of just Saudi Arabia.
  const overrideRegions = (regionsQuery.data ?? []).filter((r) => !r.isDefault);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyDefaults,
  });

  // Hydrate form when initial data arrives.
  useEffect(() => {
    if (!initial) return;
    reset({
      title: initial.title,
      title_ar: initial.title_ar ?? "",
      subtitle: initial.subtitle ?? "",
      subtitle_ar: initial.subtitle_ar ?? "",
      price: initial.price,
      discountedPrice: initial.discountedPrice,
      regionPrices: Object.fromEntries(
        (initial.regionPrices ?? []).map((rp) => [
          rp.regionId,
          { price: rp.price, discountedPrice: rp.discountedPrice },
        ])
      ),
      giftCardEnabled: initial.giftCardEnabled ?? false,
      giftCardExtraPrice: initial.giftCardExtraPrice ?? null,
      customNameEnabled: initial.customNameEnabled ?? false,
      customNamePrice: initial.customNamePrice ?? null,
      quantity: initial.quantity,
      categoryId: initial.categoryId,
      status: initial.status ?? "PUBLISHED",
      regionIds: initial.regionIds ?? [],
      images: initial.images,
      descriptions: initial.descriptions.map((d) => ({
        title: d.title ?? "",
        title_ar: d.title_ar ?? "",
        description: d.description,
        description_ar: d.description_ar ?? "",
      })),
      productOptions: initial.productOptions.map((o) => ({
        title: o.title,
        title_ar: o.title_ar ?? "",
        options: o.options,
        options_ar: o.options_ar,
        optionImages: o.optionImages ?? [],
        optionColors: o.optionColors ?? [],
        // Reconstruct each value's photo set so the picker opens with the
        // CURRENTLY-assigned images already selected. Reconcile per value (not
        // all-or-nothing): prefer that value's set, but when the set is missing
        // or empty fall back to its single `optionImages[i]` — otherwise images
        // stored only in `optionImages` (mobile app / older data) would load as
        // empty and look like they must be re-picked from scratch.
        optionImageSets: (() => {
          const sets = o.optionImageSets ?? [];
          const singles = o.optionImages ?? [];
          const len = Math.max(
            o.options?.length ?? 0,
            sets.length,
            singles.length
          );
          return Array.from({ length: len }, (_, i) => {
            const set = (sets[i] ?? []).filter((u) => u && u.trim());
            if (set.length > 0) return set;
            const single = (singles[i] ?? "").trim();
            return single ? [single] : [];
          });
        })(),
      })),
    });
  }, [initial, reset]);

  const descriptionsArray = useFieldArray({ control, name: "descriptions" });
  const optionsArray = useFieldArray({ control, name: "productOptions" });

  const images = watch("images");
  const giftCardEnabled = watch("giftCardEnabled");
  const customNameEnabled = watch("customNameEnabled");

  const submit = handleSubmit(async (values) => {
    const cleanedDescriptions = values.descriptions.map((d) => ({
      title: d.title?.trim() || null,
      title_ar: d.title_ar?.trim() || null,
      description: d.description.trim(),
      description_ar: d.description_ar?.trim() || null,
    }));
    const cleanedOptions = values.productOptions
      .map((o) => {
        // Keep each value's EN label, AR label, and photo on the same index so
        // the shop can read them index-aligned. Drop rows with an empty EN label.
        const options: string[] = [];
        const options_ar: string[] = [];
        const optionImages: string[] = [];
        const optionColors: string[] = [];
        const optionImageSets: string[][] = [];
        (o.options ?? []).forEach((s, i) => {
          const v = s.trim();
          if (!v) return;
          options.push(v);
          options_ar.push((o.options_ar?.[i] ?? "").trim());
          const set = (o.optionImageSets?.[i] ?? [])
            .map((u) => (u ?? "").trim())
            .filter(Boolean);
          optionImageSets.push(set);
          // Keep the single per-value image = first of the set (mobile/hover).
          optionImages.push(set[0] ?? (o.optionImages?.[i] ?? "").trim());
          optionColors.push((o.optionColors?.[i] ?? "").trim());
        });
        return {
          title: o.title.trim(),
          title_ar: o.title_ar?.trim() || null,
          options,
          options_ar,
          optionImages,
          optionColors,
          optionImageSets,
        };
      })
      // Drop entirely-empty groups (a title with no usable values).
      .filter((o) => o.options.length > 0);

    await onSubmit({
      title: values.title.trim(),
      title_ar: values.title_ar?.trim() || null,
      subtitle: values.subtitle?.trim() || null,
      subtitle_ar: values.subtitle_ar?.trim() || null,
      price: values.price,
      discountedPrice:
        values.discountedPrice === null || values.discountedPrice === undefined
          ? null
          : Number(values.discountedPrice),
      regionPrices: Object.entries(values.regionPrices ?? {}).map(([regionId, v]) => ({
        regionId,
        price: v.price ?? null,
        discountedPrice: v.discountedPrice ?? null,
      })),
      giftCardEnabled: values.giftCardEnabled,
      giftCardExtraPrice:
        values.giftCardExtraPrice === null || values.giftCardExtraPrice === undefined
          ? null
          : Number(values.giftCardExtraPrice),
      customNameEnabled: values.customNameEnabled,
      customNamePrice:
        values.customNamePrice === null || values.customNamePrice === undefined
          ? null
          : Number(values.customNamePrice),
      quantity: values.quantity,
      categoryId: values.categoryId || null,
      status: values.status,
      regionIds: values.regionIds,
      images: values.images,
      descriptions: cleanedDescriptions,
      productOptions: cleanedOptions,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      {/* MAIN COLUMN */}
      <div className="flex flex-col gap-6">
        <Card title={t("admin.productForm.basicsHeading")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.productForm.titleEn")}
              placeholder="Garden Bouquet"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label={t("admin.productForm.titleAr")}
              placeholder="باقة الحديقة"
              dir="rtl"
              {...register("title_ar")}
            />
            <Input
              label={t("admin.productForm.subtitleEn")}
              placeholder="A garden in bloom"
              {...register("subtitle")}
            />
            <Input
              label={t("admin.productForm.subtitleAr")}
              dir="rtl"
              {...register("subtitle_ar")}
            />
          </div>
        </Card>

        <Card title={t("admin.productForm.pricingHeading")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={t("admin.productForm.priceLabel")}
              type="number"
              step="0.01"
              min="0"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <Input
              label={t("admin.productForm.discountedPriceLabel")}
              type="number"
              step="0.01"
              min="0"
              hint={t("admin.productForm.discountedPriceHint")}
              {...register("discountedPrice", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
            <Input
              label={t("admin.productForm.stockLabel")}
              type="number"
              step="1"
              min="0"
              error={errors.quantity?.message}
              {...register("quantity", { valueAsNumber: true })}
            />
          </div>

          {overrideRegions.map((region) => (
            <div key={region.id} className="mt-4 border-t border-ink-100 pt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                {t("admin.productForm.regionalPricingHeading", {
                  region: region.name,
                  currency: region.currency,
                })}
              </p>
              <p className="mb-3 text-xs text-ink-500">
                {t("admin.productForm.regionalPricingHint", { currency: region.currency })}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t("admin.productForm.regionPriceLabel", { currency: region.currency })}
                  type="number"
                  step="0.01"
                  min="0"
                  error={
                    (errors.regionPrices as Record<string, { price?: { message?: string } }> | undefined)?.[
                      region.id
                    ]?.price?.message
                  }
                  {...register(`regionPrices.${region.id}.price`, {
                    setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                  })}
                />
                <Input
                  label={t("admin.productForm.regionDiscountedPriceLabel", { currency: region.currency })}
                  type="number"
                  step="0.01"
                  min="0"
                  hint={t("admin.productForm.regionDiscountedPriceHint")}
                  error={
                    (
                      errors.regionPrices as
                        | Record<string, { discountedPrice?: { message?: string } }>
                        | undefined
                    )?.[region.id]?.discountedPrice?.message
                  }
                  {...register(`regionPrices.${region.id}.discountedPrice`, {
                    setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                  })}
                />
              </div>
            </div>
          ))}

          <div className="mt-4 border-t border-ink-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
              Gift options
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("giftCardEnabled")}
                    className="h-5 w-5 accent-bloom-600"
                  />
                  <span className="text-sm font-medium text-ink-900">
                    Offer a gift card message
                  </span>
                </label>
                <Input
                  label="Extra charge (leave empty for free)"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!giftCardEnabled}
                  error={errors.giftCardExtraPrice?.message}
                  {...register("giftCardExtraPrice", {
                    setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                  })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("customNameEnabled")}
                    className="h-5 w-5 accent-bloom-600"
                  />
                  <span className="text-sm font-medium text-ink-900">
                    Offer a custom name add-on
                  </span>
                </label>
                <Input
                  label="Extra charge"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!customNameEnabled}
                  error={errors.customNamePrice?.message}
                  {...register("customNamePrice", {
                    setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                  })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title={t("admin.productForm.descriptionsHeading")}
          action={
            <button
              type="button"
              onClick={() =>
                descriptionsArray.append({
                  title: "",
                  title_ar: "",
                  description: "",
                  description_ar: "",
                })
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
            >
              <PlusIcon size={14} />
              {t("admin.productForm.addBlock")}
            </button>
          }
        >
          {descriptionsArray.fields.length === 0 ? (
            <p className="text-sm text-ink-500">
              {t("admin.productForm.descriptionsEmptyHint")}
            </p>
          ) : null}
          <div className="flex flex-col gap-4">
            {descriptionsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-ink-100 bg-cream-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    {t("admin.productForm.blockLabel", { n: index + 1 })}
                  </p>
                  <button
                    type="button"
                    aria-label={t("admin.productForm.removeBlockAria")}
                    onClick={() => descriptionsArray.remove(index)}
                    className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label={t("admin.productForm.headingEn")}
                    placeholder="Care guide"
                    {...register(`descriptions.${index}.title`)}
                  />
                  <Input
                    label={t("admin.productForm.headingAr")}
                    dir="rtl"
                    {...register(`descriptions.${index}.title_ar`)}
                  />
                </div>
                <Textarea
                  label={t("admin.productForm.bodyEn")}
                  rows={5}
                  containerClassName="mt-3"
                  error={errors.descriptions?.[index]?.description?.message}
                  {...register(`descriptions.${index}.description`)}
                />
                <Textarea
                  label={t("admin.productForm.bodyAr")}
                  rows={5}
                  containerClassName="mt-3"
                  dir="rtl"
                  {...register(`descriptions.${index}.description_ar`)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={t("admin.productForm.variantsHeading")}
          description={t("admin.productForm.variantsDescription")}
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  optionsArray.append({
                    title: "Colour",
                    title_ar: "اللون",
                    options: [""],
                    options_ar: [""],
                    optionImages: [""],
                    optionColors: [""],
                  })
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
              >
                <PlusIcon size={14} />
                {t("admin.productForm.addColour")}
              </button>
              <button
                type="button"
                onClick={() =>
                  optionsArray.append({
                    title: "",
                    title_ar: "",
                    options: [""],
                    options_ar: [""],
                    optionImages: [""],
                    optionColors: [""],
                  })
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-ink-900"
              >
                <PlusIcon size={14} />
                {t("admin.productForm.addOption")}
              </button>
            </div>
          }
        >
          {optionsArray.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-cream-50 p-5 text-center">
              <p className="text-sm font-medium text-ink-700">
                {t("admin.productForm.noVariantsTitle")}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-ink-500">
                {t("admin.productForm.noVariantsHint", {
                  addColour: t("admin.productForm.addColour"),
                  addOption: t("admin.productForm.addOption"),
                })}
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-4">
            {optionsArray.fields.map((field, index) => (
              <OptionEditor
                key={field.id}
                index={index}
                control={control}
                register={register}
                setValue={setValue}
                images={images ?? []}
                onRemove={() => optionsArray.remove(index)}
                error={errors.productOptions?.[index]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* SIDEBAR COLUMN */}
      <aside className="flex flex-col gap-6">
        <Card
          title={t("admin.productForm.visibilityHeading")}
          description={t("admin.productForm.visibilityDescription")}
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                triggerClassName="w-full rounded-lg py-2 justify-between"
                aria-label={t("admin.productForm.visibilityHeading")}
                options={[
                  { value: "PUBLISHED", label: t("admin.productForm.statusPublished") },
                  { value: "DRAFT", label: t("admin.productForm.statusDraft") },
                ]}
              />
            )}
          />
        </Card>

        <Card title="Regions">
          <Controller
            control={control}
            name="regionIds"
            render={({ field }) => (
              <RegionPicker selectedIds={field.value} onChange={field.onChange} />
            )}
          />
        </Card>

        <Card title={t("admin.productForm.categoryHeading")}>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onChange={(v) => field.onChange(v === "" ? null : v)}
                triggerClassName="w-full rounded-lg py-2 justify-between"
                aria-label={t("admin.productForm.categoryHeading")}
                options={[
                  { value: "", label: t("admin.productForm.uncategorizedOption") },
                  ...(categoriesQuery.data ?? []).map((c) => ({
                    value: c.id,
                    label: c.title,
                  })),
                ]}
              />
            )}
          />
        </Card>

        <Card
          title={t("admin.productForm.imagesHeading", { count: images?.length ?? 0 })}
          description={t("admin.productForm.imagesDescription")}
        >
          {(images?.length ?? 0) > 0 ? (
            <SortableList
              items={images ?? []}
              getId={(url) => url}
              onReorder={(next) =>
                setValue("images", next, { shouldDirty: true })
              }
              strategy="grid"
              className="grid grid-cols-2 gap-2"
            >
              {(url, i) => (
                <SortableItem key={url} id={url}>
                  {({ setNodeRef, style, isDragging, handleProps }) => (
                    <div
                      ref={setNodeRef}
                      style={style}
                      className={cn(
                        "relative overflow-hidden rounded-lg border border-ink-100 bg-white",
                        isDragging && "shadow-(--shadow-lift)"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                      {i === 0 ? (
                        <span className="absolute inset-s-1 top-1 rounded-full bg-ink-900/70 px-2 py-0.5 text-[10px] font-medium text-white">
                          {t("admin.productForm.primaryBadge")}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        {...handleProps}
                        aria-label={t("admin.common.dragToReorder")}
                        className="absolute inset-s-1 bottom-1 touch-none rounded-full bg-white/90 p-1 text-ink-600 shadow-sm hover:bg-white active:cursor-grabbing"
                        style={{ cursor: "grab" }}
                      >
                        <GripVerticalIcon size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={t("admin.productForm.removeImageAria")}
                        onClick={() =>
                          setValue(
                            "images",
                            (images ?? []).filter((u) => u !== url),
                            { shouldDirty: true }
                          )
                        }
                        className="absolute inset-e-1 top-1 rounded-full bg-white/90 p-1 text-ink-700 shadow-sm hover:bg-white"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  )}
                </SortableItem>
              )}
            </SortableList>
          ) : null}

          {(images?.length ?? 0) < 10 ? (
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUpload
                  className="mt-3"
                  value={null}
                  path="products"
                  label=""
                  multiple
                  onChange={(url) => {
                    if (url) field.onChange([...(field.value ?? []), url]);
                  }}
                  onUploadMany={(urls) => {
                    // Append up to the 10-image cap, in the order chosen.
                    const current = field.value ?? [];
                    field.onChange([...current, ...urls].slice(0, 10));
                  }}
                />
              )}
            />
          ) : null}
        </Card>
      </aside>

      <div className="lg:col-span-2 flex justify-end gap-3">
        <Button type="submit" size="lg" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface CardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function Card({ title, description, action, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink-900">{title}</h3>
          {description ? (
            <p className="text-xs text-ink-500">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// --- Variant / option editor --------------------------------------------
// A group (e.g. "Colour") holds one or more values. Each value has an English +
// Arabic label and an optional product photo. When the group is a colour group,
// the shop shows a swatch per value AND swaps the main product image to that
// value's photo on hover/tap — so this editor mirrors the storefront 1:1.

interface OptionEditorProps {
  index: number;
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  images: string[];
  onRemove: () => void;
  error?: NonNullable<FieldErrors<ProductFormValues>["productOptions"]>[number];
}

function OptionEditor({
  index,
  control,
  register,
  setValue,
  images,
  onRemove,
  error,
}: OptionEditorProps) {
  const { t } = useT();
  const title = useWatch({ control, name: `productOptions.${index}.title` }) ?? "";
  const isColor = isColorGroupTitle(title);

  return (
    <div className="rounded-xl border border-ink-100 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {isColor
              ? t("admin.productForm.colourVariantLabel")
              : t("admin.productForm.optionLabel", { n: index + 1 })}
          </p>
          {isColor ? (
            <span className="rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-medium text-bloom-700">
              {t("admin.productForm.imageSwapBadge")}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={t("admin.productForm.removeOptionGroupAria")}
          onClick={onRemove}
          className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t("admin.productForm.groupNameEn")}
          placeholder="Colour"
          error={error?.title?.message}
          {...register(`productOptions.${index}.title`)}
        />
        <Input
          label={t("admin.productForm.groupNameAr")}
          placeholder="اللون"
          dir="rtl"
          {...register(`productOptions.${index}.title_ar`)}
        />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
        {isColor
          ? t("admin.productForm.colourHint")
          : t("admin.productForm.genericGroupHint")}
      </p>

      <OptionValueRows
        index={index}
        control={control}
        setValue={setValue}
        images={images}
        isColor={isColor}
        optionsError={error?.options?.message}
      />
    </div>
  );
}

// --- Per-value rows: label (EN/AR) + swatch + attached photo -------------

interface OptionValueRowsProps {
  index: number;
  control: Control<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  images: string[];
  isColor: boolean;
  optionsError?: string;
}

function OptionValueRows({
  index,
  control,
  setValue,
  images,
  isColor,
  optionsError,
}: OptionValueRowsProps) {
  const { t } = useT();
  // Which value row currently has its image picker expanded.
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);
  // Close the open picker when clicking anywhere outside its row.
  const openRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pickerOpen === null) return;
    const onDown = (e: MouseEvent) => {
      if (openRowRef.current && !openRowRef.current.contains(e.target as Node)) {
        setPickerOpen(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  const options =
    useWatch({ control, name: `productOptions.${index}.options` }) ?? [];
  const optionsAr =
    useWatch({ control, name: `productOptions.${index}.options_ar` }) ?? [];
  const optionColors =
    useWatch({ control, name: `productOptions.${index}.optionColors` }) ?? [];
  const optionImageSets = (useWatch({
    control,
    name: `productOptions.${index}.optionImageSets`,
  }) ?? []) as string[][];

  const count = options.length;

  // Persist all parallel arrays together so a value's EN label, AR label, photo
  // set, and swatch colour always share the same index (the shop reads them
  // aligned). `optionImages` is derived = first photo of each set, which the
  // mobile app and card/hover swap read.
  const commit = (
    opts: string[],
    ars: string[],
    cols: string[],
    sets: string[][]
  ) => {
    const imgs = sets.map((set) => set?.[0] ?? "");
    setValue(`productOptions.${index}.options`, opts, { shouldDirty: true });
    setValue(`productOptions.${index}.options_ar`, ars, { shouldDirty: true });
    setValue(`productOptions.${index}.optionColors`, cols, { shouldDirty: true });
    setValue(`productOptions.${index}.optionImageSets`, sets, { shouldDirty: true });
    setValue(`productOptions.${index}.optionImages`, imgs, { shouldDirty: true });
  };
  const padded = () => {
    const ars = [...optionsAr];
    const cols = [...optionColors];
    const sets = optionImageSets.map((s) => (Array.isArray(s) ? [...s] : []));
    while (ars.length < count) ars.push("");
    while (cols.length < count) cols.push("");
    while (sets.length < count) sets.push([]);
    return { opts: [...options], ars, cols, sets };
  };
  const setEn = (i: number, v: string) => {
    const s = padded();
    s.opts[i] = v;
    commit(s.opts, s.ars, s.cols, s.sets);
  };
  const setArVal = (i: number, v: string) => {
    const s = padded();
    s.ars[i] = v;
    commit(s.opts, s.ars, s.cols, s.sets);
  };
  const toggleImg = (i: number, url: string) => {
    const s = padded();
    const set = s.sets[i];
    s.sets[i] = set.includes(url) ? set.filter((u) => u !== url) : [...set, url];
    commit(s.opts, s.ars, s.cols, s.sets);
  };
  const setColor = (i: number, hex: string) => {
    const s = padded();
    s.cols[i] = hex;
    commit(s.opts, s.ars, s.cols, s.sets);
  };
  const addRow = () => {
    const s = padded();
    commit([...s.opts, ""], [...s.ars, ""], [...s.cols, ""], [...s.sets, []]);
  };
  const removeRow = (i: number) => {
    const s = padded();
    commit(
      s.opts.filter((_, j) => j !== i),
      s.ars.filter((_, j) => j !== i),
      s.cols.filter((_, j) => j !== i),
      s.sets.filter((_, j) => j !== i)
    );
    setPickerOpen(null);
  };

  return (
    <div className="mt-3">
      <label className="mb-1.5 block text-xs font-medium text-ink-700">
        {isColor ? t("admin.productForm.coloursLabel") : t("admin.productForm.valuesLabel")}
      </label>

      <div className="flex flex-col gap-2">
        {options.map((value, i) => {
          const nameSwatch = isColor ? swatchForValue(value) : null;
          const custom = (optionColors[i] || "").trim();
          // What the swatch shows: an explicit picked colour wins over the
          // name-derived one; may still be undefined for an unknown name.
          const swatchBg = custom || nameSwatch?.swatch;
          // <input type=color> needs a plain #rrggbb; gradients/unknowns fall back.
          const hexRe = /^#([0-9a-f]{6})$/i;
          const pickerValue = hexRe.test(custom)
            ? custom
            : hexRe.test(nameSwatch?.swatch ?? "")
              ? (nameSwatch!.swatch as string)
              : "#dda0dd";
          const set = optionImageSets[i] ?? [];
          const firstImg = set[0] || "";
          // Photos already used by ANOTHER value in this group can't be reused.
          const takenElsewhere = new Set(
            optionImageSets.flatMap((s, j) => (j === i ? [] : s ?? []))
          );
          return (
            <div
              key={i}
              ref={pickerOpen === i ? openRowRef : undefined}
              className="rounded-lg border border-ink-100 bg-white p-2"
            >
              <div className="flex items-center gap-2">
                {isColor ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <label
                      className={cn(
                        "relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border",
                        nameSwatch?.needsRing && !custom
                          ? "border-ink-300"
                          : "border-black/10"
                      )}
                      style={swatchBg ? { background: swatchBg } : undefined}
                      title={t("admin.productForm.pickColourTitle")}
                    >
                      {!swatchBg ? (
                        <span className="text-[10px] text-ink-400">?</span>
                      ) : null}
                      <input
                        type="color"
                        value={pickerValue}
                        onChange={(e) => setColor(i, e.target.value)}
                        aria-label={t("admin.productForm.pickColourAria", {
                          value: value || t("admin.productForm.thisValueFallback"),
                        })}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                    {custom ? (
                      <button
                        type="button"
                        onClick={() => setColor(i, "")}
                        title={t("admin.productForm.autoColourTitle")}
                        className="text-[10px] font-medium text-ink-400 hover:text-ink-700"
                      >
                        {t("admin.productForm.autoColourLabel")}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <input
                  value={value}
                  onChange={(e) => setEn(i, e.target.value)}
                  placeholder={isColor ? "Red" : t("admin.productForm.valuePlaceholderEn")}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 text-sm focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
                />
                <input
                  value={optionsAr[i] ?? ""}
                  onChange={(e) => setArVal(i, e.target.value)}
                  dir="rtl"
                  placeholder={isColor ? "أحمر" : t("admin.productForm.valuePlaceholderArShort")}
                  className="h-9 w-20 shrink-0 rounded-lg border border-ink-200 bg-white px-2.5 text-sm focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
                />

                <button
                  type="button"
                  onClick={() => setPickerOpen(pickerOpen === i ? null : i)}
                  disabled={images.length === 0}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2 text-xs text-ink-700 hover:border-ink-400 disabled:opacity-50"
                  aria-expanded={pickerOpen === i}
                >
                  {firstImg ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={firstImg}
                        alt=""
                        className="h-6 w-6 rounded object-cover"
                      />
                      <span className="hidden sm:inline">
                        {set.length > 1
                          ? t("admin.productForm.photosCountLabel", { count: set.length })
                          : t("admin.productForm.photoLabel")}
                      </span>
                    </>
                  ) : (
                    <span>
                      {images.length === 0
                        ? t("admin.productForm.noImagesLabel")
                        : t("admin.productForm.addPhotosLabel")}
                    </span>
                  )}
                  <ChevronDown size={12} />
                </button>

                <button
                  type="button"
                  aria-label={t("admin.productForm.removeValueAria")}
                  onClick={() => removeRow(i)}
                  className="shrink-0 rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-bloom-700"
                >
                  <CloseIcon size={14} />
                </button>
              </div>

              {pickerOpen === i && images.length > 0 ? (
                <div className="mt-2 border-t border-ink-100 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {images.map((url) => {
                      const pos = set.indexOf(url);
                      const active = pos !== -1;
                      const taken = takenElsewhere.has(url);
                      return (
                        <button
                          key={url}
                          type="button"
                          disabled={taken && !active}
                          aria-pressed={active}
                          aria-label={
                            taken && !active
                              ? t("admin.productForm.alreadyUsedAria")
                              : active
                                ? t("admin.productForm.removePhotoAria")
                                : t("admin.productForm.addPhotoAria")
                          }
                          title={
                            taken && !active
                              ? t("admin.productForm.alreadyUsedAria")
                              : undefined
                          }
                          onClick={() => toggleImg(i, url)}
                          className={cn(
                            "relative h-12 w-12 overflow-hidden rounded-md ring-offset-1",
                            active
                              ? "ring-2 ring-bloom-500"
                              : "ring-1 ring-ink-200 hover:ring-ink-400",
                            taken && !active &&
                              "cursor-not-allowed opacity-40 grayscale hover:ring-ink-200"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          {active ? (
                            <span className="absolute inset-e-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bloom-500 text-[9px] font-semibold text-white">
                              {pos + 1}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">
                    {t("admin.productForm.pickPhotosHint")}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {optionsError ? (
        <p className="mt-1 text-xs text-bloom-700">{optionsError}</p>
      ) : null}

      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
      >
        <PlusIcon size={14} />{" "}
        {isColor ? t("admin.productForm.addColour") : t("admin.productForm.addValueLabel")}
      </button>

      {images.length === 0 ? (
        <p className="mt-2 text-[11px] text-ink-400">
          {t("admin.productForm.uploadImagesHint")}
        </p>
      ) : null}
    </div>
  );
}
