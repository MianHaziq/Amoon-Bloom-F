"use client";

import { useEffect } from "react";
import {
  useFieldArray,
  useForm,
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PlusIcon, TrashIcon } from "@/components/icons";
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
    const cleanedOptions = values.productOptions.map((o) => ({
      title: o.title.trim(),
      title_ar: o.title_ar?.trim() || null,
      options: o.options.map((s) => s.trim()).filter(Boolean),
      options_ar: (o.options_ar ?? []).map((s) => s.trim()).filter(Boolean),
    }));

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
          <div className="grid gap-4 sm:grid-cols-3">
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
          title="Options"
          action={
            <button
              type="button"
              onClick={() =>
                optionsArray.append({
                  title: "",
                  title_ar: "",
                  options: [],
                  options_ar: [],
                })
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-bloom-700 hover:text-bloom-800"
            >
              <PlusIcon size={14} />
              Add option
            </button>
          }
        >
          {optionsArray.fields.length === 0 ? (
            <p className="text-sm text-ink-500">
              Add option groups for variants like Size, Wrap colour, or
              Greeting card.
            </p>
          ) : null}
          <div className="flex flex-col gap-4">
            {optionsArray.fields.map((field, index) => (
              <OptionEditor
                key={field.id}
                index={index}
                control={control}
                register={register}
                onRemove={() => optionsArray.remove(index)}
                error={errors.productOptions?.[index]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* SIDEBAR COLUMN */}
      <aside className="flex flex-col gap-6">
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
          description="The first image is the primary."
        >
          <div className="grid grid-cols-2 gap-2">
            {(images ?? []).map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="relative overflow-hidden rounded-lg border border-ink-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() =>
                    setValue(
                      "images",
                      (images ?? []).filter((_, j) => j !== i),
                      { shouldDirty: true }
                    )
                  }
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink-700 shadow-sm hover:bg-white"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}
          </div>

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
                  onChange={(url) => {
                    if (url) field.onChange([...(field.value ?? []), url]);
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

// --- Option editor (chip-style choices) ---

interface OptionEditorProps {
  index: number;
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  onRemove: () => void;
  error?: NonNullable<FieldErrors<ProductFormValues>["productOptions"]>[number];
}

function OptionEditor({ index, control, register, onRemove, error }: OptionEditorProps) {
  return (
    <div className="rounded-xl border border-ink-100 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Option {index + 1}
        </p>
        <button
          type="button"
          aria-label="Remove option"
          onClick={onRemove}
          className="rounded-md p-1.5 text-bloom-700 hover:bg-bloom-50"
        >
          <TrashIcon size={14} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Title (EN)"
          placeholder="Wrap colour"
          error={error?.title?.message}
          {...register(`productOptions.${index}.title`)}
        />
        <Input
          label="Title (AR)"
          dir="rtl"
          {...register(`productOptions.${index}.title_ar`)}
        />
      </div>
      <Controller
        control={control}
        name={`productOptions.${index}.options`}
        render={({ field }) => (
          <ChipsInput
            label="Choices (EN)"
            value={field.value ?? []}
            onChange={field.onChange}
            error={error?.options?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`productOptions.${index}.options_ar`}
        render={({ field }) => (
          <ChipsInput
            label="Choices (AR)"
            dir="rtl"
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}

interface ChipsInputProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  dir?: "ltr" | "rtl";
}

function ChipsInput({ label, value, onChange, error, dir = "ltr" }: ChipsInputProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const text = (e.currentTarget.value || "").trim();
      if (!text) return;
      onChange([...value, text]);
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="mt-3">
      <label className="mb-1.5 block text-xs font-medium text-ink-700">
        {label}
      </label>
      <div
        dir={dir}
        className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 focus-within:border-bloom-500 focus-within:ring-2 focus-within:ring-bloom-500/20"
      >
        {value.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-cream-100 px-2 py-1 text-xs text-ink-800"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-ink-500 hover:text-ink-900"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          dir={dir}
          onKeyDown={handleKey}
          placeholder="Type and press Enter"
          className="flex-1 min-w-[100px] bg-transparent py-1 text-sm placeholder:text-ink-400 focus:outline-none"
        />
      </div>
      {error ? <p className="mt-1 text-xs text-bloom-700">{error}</p> : null}
    </div>
  );
}
