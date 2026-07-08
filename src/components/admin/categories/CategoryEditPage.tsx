"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { CategoryForm } from "./CategoryForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function CategoryEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const detailQuery = useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof categoriesApi.update>[1]) =>
      categoriesApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: t("admin.categoriesPage.toastUpdated"), description: updated.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
    },
    onError: (err) => toast.fromError(t("admin.categoriesPage.toastUpdateError"), err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={detailQuery.data?.title ?? t("admin.categoriesPage.editFallbackTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.categories"), href: "/admin/categories" },
          { label: detailQuery.data?.title ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">{t("admin.categoriesPage.loadError")}</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/categories")}
          >
            {t("admin.categoriesPage.backToList")}
          </button>
        </div>
      ) : (
        <CategoryForm
          initial={detailQuery.data}
          submitLabel={t("admin.common.saveChanges")}
          submitting={mutation.isPending}
          onSubmit={async (payload) => {
            await mutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}
