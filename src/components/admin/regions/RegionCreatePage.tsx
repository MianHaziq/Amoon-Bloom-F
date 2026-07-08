"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function RegionCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: regionsApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.regionsPage.toastCreated"), description: created.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
      router.push("/admin/regions");
    },
    onError: (err) => toast.fromError(t("admin.regionsPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.regionsPage.newRegion")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.regions"), href: "/admin/regions" },
          { label: t("admin.common.new") },
        ]}
      />
      <RegionForm
        submitLabel={t("admin.regionsPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
