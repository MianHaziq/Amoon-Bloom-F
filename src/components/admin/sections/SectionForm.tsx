"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RegionPicker } from "@/components/admin/RegionPicker";
import { Select } from "@/components/admin/Select";
import { SortableList, SortableItem } from "@/components/admin/Sortable";
import {
  GripVerticalIcon,
  CloseIcon,
  SearchIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { useT } from "@/i18n/useT";
import type { ApiSection, ApiSectionCreateInput, SectionLayout } from "@/features/sections/types";
import {
  resolveSectionDisplay,
  SECTION_COLUMN_OPTIONS,
  SECTION_LIMIT_OPTIONS,
  SECTION_DISPLAY_DEFAULTS,
} from "@/features/sections/display";

interface Props {
  initial?: ApiSection;
  onSubmit: (payload: ApiSectionCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function SectionForm({ initial, onSubmit, submitLabel, submitting }: Props) {
  const { t } = useT();
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t("admin.sectionForm.titleRequired")),
        title_ar: z.string().optional().nullable(),
        image: z.string().url().nullable(),
        sortOrder: z.number().int().nonnegative(),
        status: z.enum(["DRAFT", "PUBLISHED"]),
        releaseComingSoon: z.boolean(),
        onSale: z.boolean(),
        saleLabel: z.string().optional(),
        saleLabel_ar: z.string().optional(),
        kind: z.enum(["CUSTOM", "BEST_SELLERS", "NEW_ARRIVALS"]),
        desktopLayout: z.enum(["SCROLL", "GRID"]),
        mobileLayout: z.enum(["SCROLL", "GRID"]),
        desktopColumns: z.number().int(),
        mobileColumns: z.number().int(),
        desktopLimit: z.number().int(),
        mobileLimit: z.number().int(),
        regionIds: z.array(z.string()),
        productIds: z.array(z.string()),
        excludedProductIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
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
      title: "",
      title_ar: "",
      image: null,
      sortOrder: 0,
      status: "PUBLISHED",
      releaseComingSoon: false,
      onSale: false,
      saleLabel: "",
      saleLabel_ar: "",
      kind: "CUSTOM",
      desktopLayout: SECTION_DISPLAY_DEFAULTS.desktopLayout,
      desktopColumns: SECTION_DISPLAY_DEFAULTS.desktopColumns,
      desktopLimit: SECTION_DISPLAY_DEFAULTS.desktopLimit,
      mobileLayout: SECTION_DISPLAY_DEFAULTS.mobileLayout,
      mobileColumns: SECTION_DISPLAY_DEFAULTS.mobileColumns,
      mobileLimit: SECTION_DISPLAY_DEFAULTS.mobileLimit,
      regionIds: [],
      productIds: [],
      excludedProductIds: [],
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (!initial) return;
    const display = resolveSectionDisplay(initial);
    reset({
      title: initial.title,
      title_ar: initial.title_ar ?? "",
      image: initial.image,
      sortOrder: initial.sortOrder,
      status: initial.status ?? "PUBLISHED",
      releaseComingSoon: initial.releaseComingSoon ?? false,
      onSale: initial.onSale ?? false,
      saleLabel: initial.saleLabel ?? "",
      saleLabel_ar: initial.saleLabel_ar ?? "",
      kind: initial.kind ?? "CUSTOM",
      desktopLayout: display.desktopLayout,
      desktopColumns: display.desktopColumns,
      desktopLimit: display.desktopLimit,
      mobileLayout: display.mobileLayout,
      mobileColumns: display.mobileColumns,
      mobileLimit: display.mobileLimit,
      regionIds: initial.regionIds ?? [],
      productIds: initial.products.map((p) => p.id),
      // Seeded from the preview endpoint once it loads (the section GET doesn't carry
      // excluded rows) — see the preview effect below.
      excludedProductIds: [],
      categoryIds: initial.categories.map((c) => c.id),
    });
  }, [initial, reset]);

  const productIds = watch("productIds");
  const excludedProductIds = watch("excludedProductIds");
  const kind = watch("kind");
  const categoryIds = watch("categoryIds");

  // Dynamic (Best Sellers / New Arrivals) sections auto-grow. For an EXISTING one, load
  // the products the auto-grow currently adds so the admin can Pin (make permanent) or
  // Hide (exclude) them — plus the ones already hidden.
  const isDynamic = kind === "BEST_SELLERS" || kind === "NEW_ARRIVALS";
  const previewQuery = useQuery({
    queryKey: ["admin", "section-preview", initial?.id],
    queryFn: () => sectionsApi.preview(initial!.id),
    enabled: Boolean(initial?.id) && isDynamic,
  });

  // Seed excludedProductIds from the preview ONCE per section (so the admin's unsaved
  // Hide/Re-add edits aren't clobbered by a background refetch).
  const seededExcludedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!initial?.id || !previewQuery.data) return;
    if (seededExcludedFor.current === initial.id) return;
    seededExcludedFor.current = initial.id;
    setValue(
      "excludedProductIds",
      previewQuery.data.excluded.map((p) => p.id),
      { shouldDirty: false }
    );
  }, [initial?.id, previewQuery.data, setValue]);

  // Details map for any auto/excluded product, so a locally-hidden auto product can still
  // be rendered in the "hidden" list before a save round-trip.
  const previewById = useMemo(() => {
    const m = new Map<string, { id: string; title: string; image: string | null }>();
    for (const p of previewQuery.data?.auto ?? []) m.set(p.id, { id: p.id, title: p.title, image: p.image });
    for (const p of previewQuery.data?.excluded ?? []) m.set(p.id, { id: p.id, title: p.title, image: p.image });
    return m;
  }, [previewQuery.data]);

  // Auto-added products still eligible to show (not pinned, not hidden).
  const autoAdded = (previewQuery.data?.auto ?? []).filter(
    (p) => !productIds.includes(p.id) && !excludedProductIds.includes(p.id)
  );
  // Everything the admin has hidden (seeded excluded + anything hidden locally this session).
  const hiddenProducts = excludedProductIds
    .map((id) => previewById.get(id))
    .filter((p): p is { id: string; title: string; image: string | null } => Boolean(p));

  const pinAuto = (id: string) => {
    setValue("productIds", [...productIds, id], { shouldDirty: true });
    setValue("excludedProductIds", excludedProductIds.filter((x) => x !== id), { shouldDirty: true });
  };
  const hideAuto = (id: string) => {
    if (!excludedProductIds.includes(id)) {
      setValue("excludedProductIds", [...excludedProductIds, id], { shouldDirty: true });
    }
  };
  const reAdd = (id: string) => {
    setValue("excludedProductIds", excludedProductIds.filter((x) => x !== id), { shouldDirty: true });
  };
  const desktopLayout = watch("desktopLayout");
  const desktopColumns = watch("desktopColumns");
  const desktopLimit = watch("desktopLimit");
  const mobileLayout = watch("mobileLayout");
  const mobileColumns = watch("mobileColumns");
  const mobileLimit = watch("mobileLimit");

  const products = (productsQuery.data?.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    image: p.image,
  }));
  const categories = (categoriesQuery.data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    image: c.image,
  }));

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      title: v.title.trim(),
      title_ar: v.title_ar?.trim() || null,
      image: v.image,
      sortOrder: v.sortOrder,
      status: v.status,
      releaseComingSoon: v.releaseComingSoon,
      onSale: v.onSale,
      saleLabel: v.saleLabel?.trim() || null,
      saleLabel_ar: v.saleLabel_ar?.trim() || null,
      kind: v.kind,
      desktopLayout: v.desktopLayout,
      desktopColumns: v.desktopColumns,
      desktopLimit: v.desktopLimit,
      mobileLayout: v.mobileLayout,
      mobileColumns: v.mobileColumns,
      mobileLimit: v.mobileLimit,
      regionIds: v.regionIds,
      productIds: v.productIds,
      // Only meaningful for dynamic sections; harmless (empty) for CUSTOM.
      excludedProductIds: v.excludedProductIds,
      categoryIds: v.categoryIds,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.sectionForm.detailsHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.sectionForm.titleEn")}
              placeholder="Best sellers"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input label={t("admin.sectionForm.titleAr")} dir="rtl" {...register("title_ar")} />
          </div>
        </section>

        <OrderedMultiSelect
          label={t("admin.sectionForm.productsLabel")}
          items={products}
          selectedIds={productIds}
          onChange={(ids) => setValue("productIds", ids, { shouldDirty: true })}
          loading={productsQuery.isPending}
          searchable
          emptyHint={t("admin.sectionForm.noProductsYet")}
        />

        {isDynamic && initial?.id && (
          <AutoAddedPanel
            loading={previewQuery.isPending}
            autoAdded={autoAdded}
            hiddenProducts={hiddenProducts}
            onPin={pinAuto}
            onHide={hideAuto}
            onReAdd={reAdd}
          />
        )}

        <OrderedMultiSelect
          label={t("admin.sectionForm.categoriesLabel")}
          items={categories}
          selectedIds={categoryIds}
          onChange={(ids) => setValue("categoryIds", ids, { shouldDirty: true })}
          loading={categoriesQuery.isPending}
          emptyHint={t("admin.sectionForm.noCategoriesYet")}
        />
      </div>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">{t("admin.sectionForm.visibilityHeading")}</h3>
          <p className="mb-3 text-xs text-ink-500">
            {t("admin.sectionForm.visibilityHint")}
          </p>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                triggerClassName="w-full rounded-lg py-2 justify-between"
                aria-label={t("admin.sectionForm.visibilityHeading")}
                options={[
                  { value: "PUBLISHED", label: t("admin.sectionForm.statusPublished") },
                  { value: "DRAFT", label: t("admin.sectionForm.statusDraft") },
                ]}
              />
            )}
          />

          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
            {t("admin.sectionForm.kindLabel")}
          </label>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                triggerClassName="w-full rounded-lg py-2 justify-between"
                aria-label={t("admin.sectionForm.kindLabel")}
                options={[
                  { value: "CUSTOM", label: t("admin.sectionForm.kindCustom") },
                  { value: "BEST_SELLERS", label: t("admin.sectionForm.kindBestSellers") },
                  { value: "NEW_ARRIVALS", label: t("admin.sectionForm.kindNewArrivals") },
                ]}
              />
            )}
          />
          <p className="mb-1 mt-1.5 text-xs text-ink-500">
            {t("admin.sectionForm.kindHint")}
          </p>

          <div className="mt-4 rounded-lg border border-ink-100 bg-cream-50/60 p-3">
            <Controller
              control={control}
              name="releaseComingSoon"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-bloom-600 focus:ring-bloom-500/30"
                  />
                  <span className="text-sm text-ink-800">
                    <span className="font-medium">{t("admin.sectionForm.releaseComingSoonLabel")}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {t("admin.sectionForm.releaseComingSoonHint")}
                    </span>
                  </span>
                </label>
              )}
            />
          </div>

          <div className="mt-4 rounded-lg border border-ink-100 bg-cream-50/60 p-3">
            <Controller
              control={control}
              name="onSale"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-bloom-600 focus:ring-bloom-500/30"
                  />
                  <span className="text-sm text-ink-800">
                    <span className="font-medium">{t("admin.sectionForm.onSaleLabel")}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {t("admin.sectionForm.onSaleHint")}
                    </span>
                  </span>
                </label>
              )}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                label={t("admin.sectionForm.saleLabelEn")}
                placeholder={t("admin.sectionForm.saleLabelPlaceholder")}
                {...register("saleLabel")}
              />
              <Input
                label={t("admin.sectionForm.saleLabelAr")}
                placeholder={t("admin.sectionForm.saleLabelPlaceholderAr")}
                dir="rtl"
                {...register("saleLabel_ar")}
              />
            </div>
          </div>

          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
            {t("admin.sectionForm.sortOrderLabel")}
          </label>
          <Input
            type="number"
            step="1"
            min="0"
            hint={t("admin.sectionForm.sortOrderHint")}
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </section>

        <section className="@container rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">
            {t("admin.sectionForm.layoutHeading")}
          </h3>
          <p className="mb-4 text-xs text-ink-500">{t("admin.sectionForm.layoutHint")}</p>

          {/* Desktop/Mobile go side-by-side only when the CARD (not the viewport) is
              wide enough — it sits in the narrow aside on large screens, so a viewport
              breakpoint would wrongly split it there. Below 26rem it stacks. */}
          <div className="grid gap-4 @[26rem]:grid-cols-2">
            <LayoutFieldset
              title={t("admin.sectionForm.layoutDesktop")}
              layout={desktopLayout}
              columns={desktopColumns}
              columnOptions={SECTION_COLUMN_OPTIONS.desktop}
              limit={desktopLimit}
              limitOptions={SECTION_LIMIT_OPTIONS.desktop}
              onLayoutChange={(v) => setValue("desktopLayout", v, { shouldDirty: true })}
              onColumnsChange={(v) => setValue("desktopColumns", v, { shouldDirty: true })}
              onLimitChange={(v) => setValue("desktopLimit", v, { shouldDirty: true })}
            />
            <LayoutFieldset
              title={t("admin.sectionForm.layoutMobile")}
              layout={mobileLayout}
              columns={mobileColumns}
              columnOptions={SECTION_COLUMN_OPTIONS.mobile}
              limit={mobileLimit}
              limitOptions={SECTION_LIMIT_OPTIONS.mobile}
              onLayoutChange={(v) => setValue("mobileLayout", v, { shouldDirty: true })}
              onColumnsChange={(v) => setValue("mobileColumns", v, { shouldDirty: true })}
              onLimitChange={(v) => setValue("mobileLimit", v, { shouldDirty: true })}
            />
          </div>
          <p className="mt-3 text-[11px] text-ink-400">
            {t("admin.sectionForm.layoutPreviewNote")}
          </p>
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
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.sectionForm.coverImageHeading")}</h3>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} path="uploads" label="" />
            )}
          />
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

// --- Per-breakpoint layout controls + a live mini-preview of the resulting layout.

interface LayoutFieldsetProps {
  title: string;
  layout: SectionLayout;
  columns: number;
  columnOptions: readonly number[];
  limit: number;
  limitOptions: readonly number[];
  onLayoutChange: (v: SectionLayout) => void;
  onColumnsChange: (v: number) => void;
  onLimitChange: (v: number) => void;
}

function LayoutFieldset({
  title,
  layout,
  columns,
  columnOptions,
  limit,
  limitOptions,
  onLayoutChange,
  onColumnsChange,
  onLimitChange,
}: LayoutFieldsetProps) {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-ink-100 bg-cream-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
        {title}
      </p>

      {/* Stacked (not side-by-side): this fieldset sits in the narrow right-hand
          aside, where two selects per row overflow the card. `min-w-0` also lets each
          Select shrink past its default 128px floor so it never spills out. */}
      <label className="mb-1 block text-[11px] text-ink-500">
        {t("admin.sectionForm.layoutModeLabel")}
      </label>
      <Select
        value={layout}
        onChange={(v) => onLayoutChange(v as SectionLayout)}
        triggerClassName="w-full min-w-0 rounded-lg py-1.5 justify-between bg-white"
        aria-label={`${title} — ${t("admin.sectionForm.layoutModeLabel")}`}
        options={[
          { value: "GRID", label: t("admin.sectionForm.layoutGrid") },
          { value: "SCROLL", label: t("admin.sectionForm.layoutScroll") },
        ]}
      />

      <label className="mb-1 mt-3 block text-[11px] text-ink-500">
        {t("admin.sectionForm.layoutColumnsLabel")}
      </label>
      <Select
        value={String(columns)}
        onChange={(v) => onColumnsChange(Number(v))}
        triggerClassName="w-full min-w-0 rounded-lg py-1.5 justify-between bg-white"
        aria-label={`${title} — ${t("admin.sectionForm.layoutColumnsLabel")}`}
        options={columnOptions.map((n) => ({ value: String(n), label: String(n) }))}
      />

      <label className="mb-1 mt-3 block text-[11px] text-ink-500">
        {t("admin.sectionForm.layoutLimitLabel")}
      </label>
      <Select
        value={String(limit)}
        onChange={(v) => onLimitChange(Number(v))}
        triggerClassName="w-full min-w-0 rounded-lg py-1.5 justify-between bg-white"
        aria-label={`${title} — ${t("admin.sectionForm.layoutLimitLabel")}`}
        options={limitOptions.map((n) => ({ value: String(n), label: String(n) }))}
      />

      <p className="mb-1.5 mt-3 text-[11px] text-ink-500">
        {t("admin.sectionForm.layoutPreview")}
      </p>
      <LayoutPreview layout={layout} columns={columns} limit={limit} />
    </div>
  );
}

/** A tiny, non-interactive mock of how the section will lay out, so grid vs scroll,
 *  the column count, and the max-products cap read at a glance while editing.
 *  Deliberately schematic — the real card sizes come from the storefront. */
function LayoutPreview({
  layout,
  columns,
  limit,
}: {
  layout: SectionLayout;
  columns: number;
  limit: number;
}) {
  const { t } = useT();
  const caption = (
    <p className="mt-1.5 text-center text-[10px] text-ink-400">
      {t("admin.sectionForm.layoutShowsFirst", { n: limit })}
    </p>
  );
  if (layout === "GRID") {
    // Up to two rows so a small cap shows a partial fill and a big cap shows density.
    const cardCount = Math.max(1, Math.min(limit, columns * 2));
    return (
      <div>
        <div className="rounded-lg border border-ink-100 bg-white p-2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cardCount }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-bloom-100" />
            ))}
          </div>
        </div>
        {caption}
      </div>
    );
  }
  // SCROLL — a row of cards with the next one clipped by the frame to signal the
  // row scrolls; the little bar underneath mimics the storefront pagination dots.
  return (
    <div>
      <div className="rounded-lg border border-ink-100 bg-white p-2">
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: columns + 1 }).map((_, i) => (
            <div
              key={i}
              className="h-8 shrink-0 rounded bg-bloom-100"
              style={{ width: `calc((100% - ${columns} * 0.25rem) / ${columns + 0.4})` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-center gap-1" aria-hidden="true">
          <div className="h-1 w-6 rounded-full bg-bloom-300" />
          <div className="h-1 w-1.5 rounded-full bg-ink-200" />
        </div>
      </div>
      {caption}
    </div>
  );
}

// --- Auto-added products panel (dynamic Best Sellers / New Arrivals sections).
// Shows the products the auto-grow currently surfaces beyond the hand-picked ones, so
// the admin can Pin one (make it a permanent pick) or Hide it (exclude from auto-grow),
// plus the ones already hidden (re-add).

interface AutoProduct {
  id: string;
  title: string;
  image: string | null;
}

function ProductRow({
  product,
  children,
}: {
  product: AutoProduct;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-50">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] font-semibold uppercase text-ink-400">
            {product.title.charAt(0)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-ink-800">{product.title}</span>
      <span className="flex shrink-0 items-center gap-1.5">{children}</span>
    </li>
  );
}

function AutoAddedPanel({
  loading,
  autoAdded,
  hiddenProducts,
  onPin,
  onHide,
  onReAdd,
}: {
  loading?: boolean;
  autoAdded: AutoProduct[];
  hiddenProducts: AutoProduct[];
  onPin: (id: string) => void;
  onHide: (id: string) => void;
  onReAdd: (id: string) => void;
}) {
  const pillBtn =
    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-400";
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h3 className="mb-1 font-display text-lg text-ink-900">Auto-added products</h3>
      <p className="mb-4 text-xs text-ink-500">
        These appear automatically (newest / top-selling) on top of your picks above.
        <span className="font-medium text-ink-700"> Pin</span> to lock one in as a
        permanent pick, or <span className="font-medium text-ink-700">Hide</span> to keep
        it out of this section. Save to apply.
      </p>

      {loading ? (
        <p className="text-sm text-ink-400">Loading auto-added products…</p>
      ) : autoAdded.length === 0 ? (
        <p className="text-sm text-ink-400">
          No auto-added products right now — this section shows only your picks.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {autoAdded.map((p) => (
            <ProductRow key={p.id} product={p}>
              <button
                type="button"
                onClick={() => onPin(p.id)}
                className={cn(pillBtn, "bg-bloom-50 text-bloom-700 hover:bg-bloom-100")}
              >
                Pin
              </button>
              <button
                type="button"
                onClick={() => onHide(p.id)}
                className={cn(pillBtn, "bg-ink-50 text-ink-600 hover:bg-ink-100")}
              >
                Hide
              </button>
            </ProductRow>
          ))}
        </ul>
      )}

      {hiddenProducts.length > 0 && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Hidden from this section ({hiddenProducts.length})
          </p>
          <ul className="flex flex-col gap-2">
            {hiddenProducts.map((p) => (
              <ProductRow key={p.id} product={p}>
                <button
                  type="button"
                  onClick={() => onReAdd(p.id)}
                  className={cn(pillBtn, "bg-ink-50 text-ink-600 hover:bg-ink-100")}
                >
                  Re-add
                </button>
              </ProductRow>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// --- Ordered multi-select: pick items, then drag the chosen ones to order them.

interface PickItem {
  id: string;
  title: string;
  image?: string | null;
}

interface OrderedMultiSelectProps {
  label: string;
  items: PickItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  searchable?: boolean;
  emptyHint?: string;
}

function OrderedMultiSelect({
  label,
  items,
  selectedIds,
  onChange,
  loading,
  searchable,
  emptyHint,
}: OrderedMultiSelectProps) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const byId = (id: string) => items.find((it) => it.id === id);
  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );

  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter((it) => it.title.toLowerCase().includes(query))
    : items;

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h3 className="mb-1 font-display text-lg text-ink-900">
        {label} ({selectedIds.length})
      </h3>
      <p className="mb-3 text-xs text-ink-500">
        {t("admin.sectionForm.pickHint", { label: label.toLowerCase() })}
      </p>

      {/* Chosen items — draggable to reorder */}
      {selectedIds.length > 0 ? (
        <SortableList
          items={selectedIds}
          getId={(id) => id}
          onReorder={onChange}
          className="mb-3 flex flex-col gap-1.5"
        >
          {(id, i) => {
            const it = byId(id);
            return (
              <SortableItem key={id} id={id}>
                {({ setNodeRef, style, isDragging, handleProps }) => (
                  <div
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-ink-100 bg-white p-1.5",
                      isDragging && "shadow-(--shadow-lift)"
                    )}
                  >
                    <button
                      type="button"
                      {...handleProps}
                      aria-label={t("admin.common.dragToReorder")}
                      className="flex h-7 w-6 shrink-0 touch-none items-center justify-center rounded text-ink-400 hover:text-ink-700 active:cursor-grabbing"
                      style={{ cursor: "grab" }}
                    >
                      <GripVerticalIcon size={14} />
                    </button>
                    <span className="w-5 shrink-0 text-center text-xs text-ink-400">
                      {i + 1}
                    </span>
                    {it?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 shrink-0 rounded bg-ink-100" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-900">
                      {it?.title ?? id}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-label={`${t("common.remove")} ${it?.title ?? ""}`}
                      className="shrink-0 rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-bloom-700"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                )}
              </SortableItem>
            );
          }}
        </SortableList>
      ) : null}

      {searchable ? (
        <div className="relative mb-2">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("admin.sectionForm.searchPlaceholder", { label: label.toLowerCase() })}
            className="h-9 w-full rounded-lg border border-ink-200 bg-white ps-9 pe-3 text-sm focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
          />
        </div>
      ) : null}

      <div className="grid max-h-60 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
        {loading ? (
          <p className="p-2 text-sm text-ink-400">{t("common.loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="p-2 text-sm text-ink-400">
            {query ? t("admin.common.noMatches") : emptyHint ?? t("admin.common.nothingToShow")}
          </p>
        ) : (
          filtered.map((it) => {
            const checked = selectedIds.includes(it.id);
            return (
              <label
                key={it.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  checked ? "bg-bloom-100 text-bloom-800" : "hover:bg-cream-100"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(it.id)}
                  className="shrink-0 accent-bloom-600"
                />
                <span className="min-w-0 truncate">{it.title}</span>
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}
