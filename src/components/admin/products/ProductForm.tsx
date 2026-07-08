"use client";

import { useEffect, useRef, useState } from "react";
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
import { queryKeys } from "@/services/queryKeys";
import { Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
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
import type {
  ApiProduct,
  ApiProductCreateInput,
} from "@/features/products/api-types";

const descriptionSchema = z.object({
  title: z.string().optional().nullable(),
  title_ar: z.string().optional().nullable(),
  description: z.string().min(1, "Description text is required"),
  description_ar: z.string().optional().nullable(),
});

const optionSchema = z.object({
  title: z.string().min(1, "Option title required"),
  title_ar: z.string().optional().nullable(),
  options: z
    .array(z.string())
    .min(1, "Add at least one choice"),
  options_ar: z.array(z.string()).optional(),
  // Optional per-choice image URLs (first photo of each set), aligned with `options`.
  optionImages: z.array(z.string()).optional(),
  // Optional per-choice swatch colours (hex), aligned by index with `options`.
  optionColors: z.array(z.string()).optional(),
  // Optional per-choice image SETS (several photos per value), aligned with `options`.
  optionImageSets: z.array(z.array(z.string())).optional(),
});

const productFormSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  title_ar: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  subtitle_ar: z.string().optional().nullable(),
  price: z.number({ message: "Enter a valid price" }).nonnegative("Price must be ≥ 0"),
  discountedPrice: z
    .number()
    .nonnegative("Discount must be ≥ 0")
    .nullable(),
  quantity: z.number().int("Whole number").nonnegative("Stock must be ≥ 0"),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  images: z.array(z.string().url()).max(10, "Up to 10 images"),
  descriptions: z.array(descriptionSchema),
  productOptions: z.array(optionSchema),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

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
  quantity: 0,
  categoryId: null,
  status: "PUBLISHED",
  images: [],
  descriptions: [],
  productOptions: [],
};

export function ProductForm({ initial, onSubmit, submitting, submitLabel }: ProductFormProps) {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  });

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
      quantity: initial.quantity,
      categoryId: initial.categoryId,
      status: initial.status ?? "PUBLISHED",
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
        optionImageSets:
          o.optionImageSets && o.optionImageSets.length > 0
            ? o.optionImageSets
            : (o.optionImages ?? []).map((u) => (u ? [u] : [])),
      })),
    });
  }, [initial, reset]);

  const descriptionsArray = useFieldArray({ control, name: "descriptions" });
  const optionsArray = useFieldArray({ control, name: "productOptions" });

  const images = watch("images");

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
      quantity: values.quantity,
      categoryId: values.categoryId || null,
      status: values.status,
      images: values.images,
      descriptions: cleanedDescriptions,
      productOptions: cleanedOptions,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      {/* MAIN COLUMN */}
      <div className="flex flex-col gap-6">
        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title (English)"
              placeholder="Garden Bouquet"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Title (Arabic)"
              placeholder="باقة الحديقة"
              dir="rtl"
              {...register("title_ar")}
            />
            <Input
              label="Subtitle (English)"
              placeholder="A garden in bloom"
              {...register("subtitle")}
            />
            <Input
              label="Subtitle (Arabic)"
              dir="rtl"
              {...register("subtitle_ar")}
            />
          </div>
        </Card>

        <Card title="Pricing & inventory">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <Input
              label="Discounted price"
              type="number"
              step="0.01"
              min="0"
              hint="Leave empty for no discount"
              {...register("discountedPrice", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
            <Input
              label="Stock"
              type="number"
              step="1"
              min="0"
              error={errors.quantity?.message}
              {...register("quantity", { valueAsNumber: true })}
            />
          </div>
        </Card>

        <Card
          title="Descriptions"
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
              Add block
            </button>
          }
        >
          {descriptionsArray.fields.length === 0 ? (
            <p className="text-sm text-ink-500">
              Add one or more description blocks (e.g. &ldquo;Care guide&rdquo;,
              &ldquo;Composition&rdquo;).
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
                    Block {index + 1}
                  </p>
                  <button
                    type="button"
                    aria-label="Remove block"
                    onClick={() => descriptionsArray.remove(index)}
                    className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Heading (EN)"
                    placeholder="Care guide"
                    {...register(`descriptions.${index}.title`)}
                  />
                  <Input
                    label="Heading (AR)"
                    dir="rtl"
                    {...register(`descriptions.${index}.title_ar`)}
                  />
                </div>
                <Textarea
                  label="Body (EN)"
                  rows={3}
                  containerClassName="mt-3"
                  error={errors.descriptions?.[index]?.description?.message}
                  {...register(`descriptions.${index}.description`)}
                />
                <Textarea
                  label="Body (AR)"
                  rows={3}
                  containerClassName="mt-3"
                  dir="rtl"
                  {...register(`descriptions.${index}.description_ar`)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Variants & options"
          description="Colour, size, wrap, greeting card… For colour, attach a photo to each value and the shop swaps the main image when a shopper hovers or taps that colour."
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
                Add colour
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
                Add option
              </button>
            </div>
          }
        >
          {optionsArray.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-cream-50 p-5 text-center">
              <p className="text-sm font-medium text-ink-700">
                No variants yet
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-ink-500">
                Tap <span className="font-medium text-bloom-700">Add colour</span>{" "}
                to offer colour choices with a photo per colour, or{" "}
                <span className="font-medium text-ink-700">Add option</span> for
                sizes, wraps, greeting cards, etc.
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
          title="Visibility"
          description="Published products are live on the shop. Draft hides them from customers."
        >
          <select
            {...register("status")}
            className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
          >
            <option value="PUBLISHED">Published — visible on the shop</option>
            <option value="DRAFT">Draft — hidden from customers</option>
          </select>
        </Card>

        <Card title="Category">
          <select
            {...register("categoryId", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
          >
            <option value="">— Uncategorised —</option>
            {categoriesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Card>

        <Card
          title={`Images (${images?.length ?? 0}/10)`}
          description="The first image is the primary. Square (1:1) recommended."
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
                          Primary
                        </span>
                      ) : null}
                      <button
                        type="button"
                        {...handleProps}
                        aria-label="Drag to reorder"
                        className="absolute inset-s-1 bottom-1 touch-none rounded-full bg-white/90 p-1 text-ink-600 shadow-sm hover:bg-white active:cursor-grabbing"
                        style={{ cursor: "grab" }}
                      >
                        <GripVerticalIcon size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove image"
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
  const title = useWatch({ control, name: `productOptions.${index}.title` }) ?? "";
  const isColor = isColorGroupTitle(title);

  return (
    <div className="rounded-xl border border-ink-100 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {isColor ? "Colour variant" : `Option ${index + 1}`}
          </p>
          {isColor ? (
            <span className="rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] font-medium text-bloom-700">
              image swap on
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Remove option group"
          onClick={onRemove}
          className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Group name (EN)"
          placeholder="Colour"
          error={error?.title?.message}
          {...register(`productOptions.${index}.title`)}
        />
        <Input
          label="Group name (AR)"
          placeholder="اللون"
          dir="rtl"
          {...register(`productOptions.${index}.title_ar`)}
        />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
        {isColor
          ? "Recognised colour names (Red, Blue, Pink, Gold…) show a swatch automatically. Attach a photo to each colour to power the shop’s hover/tap image swap."
          : "Tip: name this group “Colour” (or اللون) to turn it into a colour variant with swatches and per-colour image swap on the shop."}
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
        {isColor ? "Colours" : "Values"}
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
                      title="Click to pick an exact colour"
                    >
                      {!swatchBg ? (
                        <span className="text-[10px] text-ink-400">?</span>
                      ) : null}
                      <input
                        type="color"
                        value={pickerValue}
                        onChange={(e) => setColor(i, e.target.value)}
                        aria-label={`Pick colour for ${value || "this value"}`}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                    {custom ? (
                      <button
                        type="button"
                        onClick={() => setColor(i, "")}
                        title="Use the name's colour instead"
                        className="text-[10px] font-medium text-ink-400 hover:text-ink-700"
                      >
                        auto
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <input
                  value={value}
                  onChange={(e) => setEn(i, e.target.value)}
                  placeholder={isColor ? "Red" : "Value (EN)"}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 text-sm focus:border-bloom-500 focus:outline-none focus:ring-2 focus:ring-bloom-500/20"
                />
                <input
                  value={optionsAr[i] ?? ""}
                  onChange={(e) => setArVal(i, e.target.value)}
                  dir="rtl"
                  placeholder={isColor ? "أحمر" : "(AR)"}
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
                        {set.length > 1 ? `${set.length} photos` : "Photo"}
                      </span>
                    </>
                  ) : (
                    <span>{images.length === 0 ? "No images" : "Add photos"}</span>
                  )}
                  <ChevronDown size={12} />
                </button>

                <button
                  type="button"
                  aria-label="Remove value"
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
                              ? "Already used by another colour"
                              : active
                                ? "Remove this photo"
                                : "Add this photo"
                          }
                          title={
                            taken && !active
                              ? "Already used by another colour"
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
                    Pick one or more photos — the first (①) shows on hover. Each
                    photo belongs to one colour only.
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
        <PlusIcon size={14} /> {isColor ? "Add colour" : "Add value"}
      </button>

      {images.length === 0 ? (
        <p className="mt-2 text-[11px] text-ink-400">
          Upload product images (in the Images card) to attach one to each value.
        </p>
      ) : null}
    </div>
  );
}
