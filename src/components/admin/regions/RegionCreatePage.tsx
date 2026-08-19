"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { PageHeader } from "@/components/admin/PageHeader";
import { RegionForm } from "./RegionForm";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

type RegionTab = "details" | "pages" | "branches";

export function RegionCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useT();
  const [tab, setTab] = useState<RegionTab>("details");

  const mutation = useMutation({
    mutationFn: regionsApi.create,
    onSuccess: (created) => {
      toast.success({ title: t("admin.regionsPage.toastCreated"), description: created.code });
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all });
      revalidateCatalog(["regions"]);
      // Hand straight off to the region's editor on the Pages tab — that's where
      // legal pages + branches are authored (they need a saved region to attach to).
      router.push(`/admin/regions/${created.id}/edit?tab=pages`);
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

      <div className="mb-6 flex flex-wrap gap-1 border-b border-ink-100">
        {([
          ["details", t("admin.regionForm.tabDetails")],
          ["pages", t("admin.regionForm.tabPages")],
          ["branches", t("admin.regionForm.tabBranches")],
        ] as [RegionTab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key ? "border-bloom-500 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <RegionForm
          submitLabel={t("admin.regionsPage.createSubmit")}
          submitting={mutation.isPending}
          onSubmit={async (payload) => {
            await mutation.mutateAsync(payload);
          }}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
          {t("admin.regionForm.createFirstHint")}
        </div>
      )}
    </div>
  );
}
