"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import type { ApiSection, ApiSectionCreateInput } from "@/features/sections/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ar: z.string().optional().nullable(),
  image: z.string().url().nullable(),
  sortOrder: z.number().int().nonnegative(),
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
      productIds: initial.products.map((p) => p.id),
      categoryIds: initial.categories.map((c) => c.id),
    });
  }, [initial, reset]);

  const productIds = watch("productIds");
  const categoryIds = watch("categoryIds");

  const toggle = (list: string[], id: string, key: "productIds" | "categoryIds") => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setValue(key, next, { shouldDirty: true });
  };

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      title: v.title.trim(),
      title_ar: v.title_ar?.trim() || null,
      image: v.image,
      sortOrder: v.sortOrder,
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
              placeholder="Editor's picks"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input label="Title (AR)" dir="rtl" {...register("title_ar")} />
            <Input
              label="Sort order"
              type="number"
              step="1"
              min="0"
              hint="Lower numbers come first."
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">
            Products ({productIds.length})
          </h3>
          <div className="grid max-h-72 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
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
                    onChange={() => toggle(productIds, p.id, "productIds")}
                    className="accent-bloom-600"
                  />
                  {p.title}
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">
            Categories ({categoryIds.length})
          </h3>
          <div className="grid max-h-72 gap-1 overflow-y-auto rounded-xl border border-ink-100 bg-cream-50 p-3 sm:grid-cols-2">
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
                    onChange={() => toggle(categoryIds, c.id, "categoryIds")}
                    className="accent-bloom-600"
                  />
                  {c.title}
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Cover</h3>
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
