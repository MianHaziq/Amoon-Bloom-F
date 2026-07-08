"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "./ProductForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function ProductCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.productsPage.toastCreated"), description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      revalidateCatalog();
      router.push("/admin/products");
    },
    onError: (err) => toast.fromError(t("admin.productsPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.productsPage.newProduct")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.products"), href: "/admin/products" },
          { label: t("admin.common.new") },
        ]}
      />
      <ProductForm
        submitLabel={t("admin.productsPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
