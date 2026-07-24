"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RegionPicker } from "@/components/admin/RegionPicker";
import { Select } from "@/components/admin/Select";
import { useT } from "@/i18n/useT";
import type {
  ApiCategory,
  ApiCategoryCreateInput,
} from "@/features/categories/api-types";

interface CategoryFormProps {
  initial?: ApiCategory;
  onSubmit: (payload: ApiCategoryCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function CategoryForm({ initial, onSubmit, submitLabel, submitting }: CategoryFormProps) {
  const { t } = useT();
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t("admin.categoryForm.titleRequired")),
        title_ar: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        description_ar: z.string().optional().nullable(),
        image: z.string().url().nullable(),
        status: z.enum(["DRAFT", "PUBLISHED"]),
        deliveryLeadDays: z
          .number()
          .int()
          .min(0, t("admin.categoryForm.deliveryLeadDaysInvalid"))
          .max(30, t("admin.categoryForm.deliveryLeadDaysInvalid"))
          .nullable(),
        regionIds: z.array(z.string()),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      image: null,
      status: "PUBLISHED",
      deliveryLeadDays: null,
      regionIds: [],
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      title: initial.title,
      title_ar: initial.title_ar ?? "",
      description: initial.description ?? "",
      description_ar: initial.description_ar ?? "",
      image: initial.image,
      status: initial.status ?? "PUBLISHED",
      deliveryLeadDays: initial.deliveryLeadDays ?? null,
      regionIds: initial.regionIds ?? [],
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title.trim(),
      title_ar: values.title_ar?.trim() || null,
      description: values.description?.trim() || null,
      description_ar: values.description_ar?.trim() || null,
      image: values.image,
      status: values.status,
      deliveryLeadDays: values.deliveryLeadDays,
      regionIds: values.regionIds,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.categoryForm.namesHeading")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("admin.categoryForm.titleEn")}
              placeholder="Eid Gifts"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label={t("admin.categoryForm.titleAr")}
              dir="rtl"
              placeholder="هدايا العيد"
              {...register("title_ar")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.categoryForm.descriptionsHeading")}</h3>
          <Textarea label={t("admin.categoryForm.descriptionEn")} rows={3} {...register("description")} />
          <Textarea
            label={t("admin.categoryForm.descriptionAr")}
            rows={3}
            dir="rtl"
            containerClassName="mt-3"
            {...register("description_ar")}
          />
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">Visibility</h3>
          <p className="mb-3 text-xs text-ink-500">
            Published categories appear on the shop. Draft keeps them hidden.
          </p>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                triggerClassName="w-full rounded-lg py-2 justify-between"
                aria-label="Visibility"
                options={[
                  { value: "PUBLISHED", label: "Published — visible on the shop" },
                  { value: "DRAFT", label: "Draft — hidden from customers" },
                ]}
              />
            )}
          />
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-1 font-display text-lg text-ink-900">
            {t("admin.categoryForm.deliveryLeadDaysHeading")}
          </h3>
          <p className="mb-3 text-xs text-ink-500">
            {t("admin.categoryForm.deliveryLeadDaysHint")}
          </p>
          <Input
            type="number"
            min={0}
            max={30}
            step={1}
            placeholder={t("admin.categoryForm.deliveryLeadDaysPlaceholder")}
            error={errors.deliveryLeadDays?.message}
            {...register("deliveryLeadDays", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
            })}
          />
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
          <h3 className="mb-4 font-display text-lg text-ink-900">{t("admin.categoryForm.coverImageHeading")}</h3>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                path="uploads"
                label=""
                previewClassName="aspect-square w-full"
                hint={t("admin.categoryForm.coverImageHint")}
              />
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
