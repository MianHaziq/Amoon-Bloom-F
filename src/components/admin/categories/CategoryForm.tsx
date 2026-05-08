"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type {
  ApiCategory,
  ApiCategoryCreateInput,
} from "@/features/categories/api-types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ar: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  image: z.string().url().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  initial?: ApiCategory;
  onSubmit: (payload: ApiCategoryCreateInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}

export function CategoryForm({ initial, onSubmit, submitLabel, submitting }: CategoryFormProps) {
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
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title.trim(),
      title_ar: values.title_ar?.trim() || null,
      description: values.description?.trim() || null,
      description_ar: values.description_ar?.trim() || null,
      image: values.image,
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]" noValidate>
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Names</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title (English)"
              placeholder="Eid Gifts"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Title (Arabic)"
              dir="rtl"
              placeholder="هدايا العيد"
              {...register("title_ar")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Descriptions</h3>
          <Textarea label="Description (EN)" rows={3} {...register("description")} />
          <Textarea
            label="Description (AR)"
            rows={3}
            dir="rtl"
            containerClassName="mt-3"
            {...register("description_ar")}
          />
        </section>
      </div>

      <aside>
        <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg text-ink-900">Cover image</h3>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                path="uploads"
                label=""
                hint="Used on category cards and the navigation."
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
