"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "./CategoryForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function CategoryCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.categoriesPage.toastCreated"), description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
      router.push("/admin/categories");
    },
    onError: (err) => toast.fromError(t("admin.categoriesPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("admin.categoriesPage.newCategory")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.categories"), href: "/admin/categories" },
          { label: t("admin.common.new") },
        ]}
      />
      <CategoryForm
        submitLabel={t("admin.categoriesPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
