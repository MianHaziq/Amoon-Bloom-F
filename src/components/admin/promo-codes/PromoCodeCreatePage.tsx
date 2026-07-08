"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromoCodeForm } from "./PromoCodeForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function PromoCodeCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: promoCodesApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.promoCodesPage.toastCreated"), description: created.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.promoCodes.all });
      router.push("/admin/promo-codes");
    },
    onError: (err) => toast.fromError(t("admin.promoCodesPage.toastCreateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("admin.promoCodesPage.newPromoCode")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.promoCodes"), href: "/admin/promo-codes" },
          { label: t("admin.common.new") },
        ]}
      />
      <PromoCodeForm
        submitLabel={t("admin.promoCodesPage.createSubmit")}
        submitting={mutation.isPending}
        onSubmit={async (payload) => {
          await mutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
