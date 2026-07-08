"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SortableList, SortableItem } from "@/components/admin/Sortable";
import {
  GripVerticalIcon,
  CloseIcon,
  SearchIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import type { ApiSection, ApiSectionCreateInput } from "@/features/sections/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ar: z.string().optional().nullable(),
  image: z.string().url().nullable(),
  sortOrder: z.number().int().nonnegative(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  productIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: ApiSection;
  onSubmit: (payload: ApiSectionCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function SectionForm({ initial, onSubmit, submitLabel, submitting }: Props) {
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
      productIds: [],
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      title: initial.title,
      title_ar: initial.title_ar ?? "",
      image: initial.image,
      sortOrder: initial.sortOrder,
      status: initial.status ?? "PUBLISHED",
      productIds: initial.products.map((p) => p.id),
      categoryIds: initial.categories.map((c) => c.id),
    });
  }, [initial, reset]);

  const productIds = watch("productIds");
  const categoryIds = watch("categoryIds");

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
      productIds: v.productIds,
      categoryIds: v.categoryIds,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Section details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title (EN)"
              placeholder="Best sellers"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input label="Title (AR)" dir="rtl" {...register("title_ar")} />
          </div>
        </section>

        <OrderedMultiSelect
          label="Products"
          items={products}
          selectedIds={productIds}
          onChange={(ids) => setValue("productIds", ids, { shouldDirty: true })}
          loading={productsQuery.isPending}
          searchable
          emptyHint="No products yet."
        />

        <OrderedMultiSelect
          label="Categories"
          items={categories}
          selectedIds={categoryIds}
          onChange={(ids) => setValue("categoryIds", ids, { shouldDirty: true })}
          loading={categoriesQuery.isPending}
          emptyHint="No categories yet."
        />
      </div>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">Visibility</h3>
          <p className="mb-3 text-xs text-ink-500">
            Published sections appear on the homepage. Draft keeps them hidden.
          </p>
          <select
            {...register("status")}
            className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
          >
            <option value="PUBLISHED">Published — visible on the homepage</option>
            <option value="DRAFT">Draft — hidden</option>
          </select>

          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
            Sort order
          </label>
          <Input
            type="number"
            step="1"
            min="0"
            hint="Lower numbers come first. You can also drag sections on the list."
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Cover image</h3>
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
        Tick to add, then drag the chosen {label.toLowerCase()} to set the order
        shown on the shop.
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
                      aria-label="Drag to reorder"
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
                      aria-label={`Remove ${it?.title ?? "item"}`}
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
            placeholder={`Search ${label.toLowerCase()}…`}
            className="h-9 w-full rounded-lg border border-ink-200 bg-white ps-9 pe-3 text-sm focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
          />
        </div>
      ) : null}

      <div className="grid max-h-60 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
        {loading ? (
          <p className="p-2 text-sm text-ink-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-2 text-sm text-ink-400">
            {query ? "No matches." : emptyHint ?? "Nothing to show."}
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
