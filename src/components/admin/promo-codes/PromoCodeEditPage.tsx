"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { queryKeys } from "@/services/queryKeys";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Loader";
import { PromoCodeForm } from "./PromoCodeForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

export function PromoCodeEditPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();

  const detailQuery = useQuery({
    queryKey: queryKeys.promoCodes.detail(id),
    queryFn: () => promoCodesApi.getById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof promoCodesApi.update>[1]) =>
      promoCodesApi.update(id, payload),
    onSuccess: (updated) => {
      toast.success({ title: t("admin.promoCodesPage.toastUpdated"), description: updated.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.promoCodes.all });
      queryClient.setQueryData(queryKeys.promoCodes.detail(id), updated);
    },
    onError: (err) => toast.fromError(t("admin.promoCodesPage.toastUpdateError"), err),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={detailQuery.data?.code ?? t("admin.promoCodesPage.editFallbackTitle")}
        crumbs={[
          { label: t("admin.common.breadcrumbHome"), href: "/admin" },
          { label: t("admin.promoCodes"), href: "/admin/promo-codes" },
          { label: detailQuery.data?.code ?? "…" },
        ]}
      />

      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
          <p className="font-medium">{t("admin.promoCodesPage.loadError")}</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => router.replace("/admin/promo-codes")}
          >
            {t("admin.promoCodesPage.backToList")}
          </button>
        </div>
      ) : (
        <PromoCodeForm
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
