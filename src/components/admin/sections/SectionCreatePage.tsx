"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/features/sections/api/sections.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionForm } from "./SectionForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function SectionCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: sectionsApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.sectionsPage.toastCreated"), description: created.title });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      revalidateCatalog(["sections"]);
      router.push("/admin/sections");
    },
    onError: (err) => toast.fromError(t("admin.sectionsPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.sectionsPage.newSection")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.sections"), href: "/admin/sections" },
          { label: t("admin.common.new") },
        ]}
      />
      <SectionForm
        submitLabel={t("admin.sectionsPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
