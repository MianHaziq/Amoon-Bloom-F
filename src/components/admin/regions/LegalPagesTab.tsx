"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Button, Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "./RichTextEditor";
import { legalPagesApi } from "@/features/regions/api/legalPages.api";
import { vatApi } from "@/features/vat/api/vat.api";
import {
  LEGAL_PAGE_SLUGS,
  legalSlugToUrl,
  type ApiRegion,
  type ApiLegalPage,
  type LegalPageSlug,
} from "@/features/regions/types";
import { getLegalTemplate, legalSectionsToHtml } from "@/features/legal/templates";
import { resolveRegionContact } from "@/features/location/regionContact";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { MessageKey } from "@/i18n/messages";

const PAGE_LABEL_KEY: Record<LegalPageSlug, MessageKey> = {
  terms: "footer.termsConditions",
  privacy: "footer.privacyPolicy",
  "refund-policy": "footer.refundReturnPolicy",
  "shipping-policy": "footer.shippingPolicy",
  "product-disclaimer": "footer.productDisclaimer",
};

interface FormState {
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = { title: "", title_ar: "", content: "", content_ar: "", isPublished: true };

function fromRow(row: ApiLegalPage | undefined): FormState {
  if (!row) return { ...EMPTY_FORM };
  return {
    title: row.title ?? "",
    title_ar: row.title_ar ?? "",
    content: row.content ?? "",
    content_ar: row.content_ar ?? "",
    isPublished: row.isPublished,
  };
}

export function LegalPagesTab({ region }: { region: ApiRegion }) {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<LegalPageSlug | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLoadDefault, setConfirmLoadDefault] = useState(false);

  const listQuery = useQuery({
    queryKey: ["region-legal-pages", region.id],
    queryFn: () => legalPagesApi.listForRegion(region.id),
  });
  const vatQuery = useQuery({
    queryKey: ["region-vat-public", region.code],
    queryFn: () => vatApi.getPublic(region.code).catch(() => null),
  });

  const rowsBySlug = useMemo(() => {
    const map = new Map<LegalPageSlug, ApiLegalPage>();
    for (const row of listQuery.data ?? []) map.set(legalSlugToUrl(row.slug), row);
    return map;
  }, [listQuery.data]);

  // Selecting a page loads its current row into the form (the page list is only
  // interactive once listQuery has settled, so rowsBySlug is populated here).
  const selectPage = (slug: LegalPageSlug) => {
    setSelected(slug);
    setForm(fromRow(rowsBySlug.get(slug)));
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      legalPagesApi.upsert(region.id, selected as string, {
        title: form.title.trim() || null,
        title_ar: form.title_ar.trim() || null,
        content: form.content,
        content_ar: form.content_ar,
        isPublished: form.isPublished,
      }),
    onSuccess: () => {
      toast.success({ title: t("admin.regionForm.pageSaved") });
      queryClient.invalidateQueries({ queryKey: ["region-legal-pages", region.id] });
      revalidateCatalog(["regions"]);
    },
    onError: (err) => toast.fromError(t("admin.regionForm.pageSaveError"), err),
  });

  const deleteMutation = useMutation({
    mutationFn: () => legalPagesApi.remove(region.id, selected as string),
    onSuccess: () => {
      toast.success({ title: t("admin.regionForm.pageDeleted") });
      setConfirmDelete(false);
      setForm({ ...EMPTY_FORM });
      queryClient.invalidateQueries({ queryKey: ["region-legal-pages", region.id] });
      revalidateCatalog(["regions"]);
    },
    onError: (err) => toast.fromError(t("admin.regionForm.pageDeleteError"), err),
  });

  const loadDefault = () => {
    if (!selected) return;
    const vat = vatQuery.data ?? null;
    const en = getLegalTemplate(selected, { locale: "en", contact: resolveRegionContact(region, "en"), vat });
    const ar = getLegalTemplate(selected, { locale: "ar", contact: resolveRegionContact(region, "ar"), vat });
    setForm((f) => ({
      ...f,
      title: en.title,
      title_ar: ar.title,
      content: legalSectionsToHtml(en.sections),
      content_ar: legalSectionsToHtml(ar.sections),
    }));
    setConfirmLoadDefault(false);
  };

  function statusFor(slug: LegalPageSlug): { label: string; className: string } {
    const row = rowsBySlug.get(slug);
    const hasContent = !!(row && ((row.content && row.content.trim()) || (row.content_ar && row.content_ar.trim())));
    if (row && row.isPublished && hasContent)
      return { label: t("admin.regionForm.statusPublished"), className: "bg-green-100 text-green-700" };
    if (row && hasContent)
      return { label: t("admin.regionForm.statusDraft"), className: "bg-amber-100 text-amber-700" };
    return { label: t("admin.regionForm.statusNotSet"), className: "bg-ink-100 text-ink-500" };
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h3 className="font-display text-lg text-ink-900">{t("admin.regionForm.pagesHeading")}</h3>
      <p className="mt-1 mb-4 text-xs text-ink-500">{t("admin.regionForm.pagesHint")}</p>

      {listQuery.isPending ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Page list */}
          <ul className="flex flex-col gap-1.5">
            {LEGAL_PAGE_SLUGS.map((slug) => {
              const status = statusFor(slug);
              const active = selected === slug;
              return (
                <li key={slug}>
                  <button
                    type="button"
                    onClick={() => selectPage(slug)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm transition-colors ${
                      active ? "border-bloom-300 bg-bloom-50 text-ink-900" : "border-ink-100 bg-white text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    <span className="font-medium">{t(PAGE_LABEL_KEY[slug])}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${status.className}`}>
                      {status.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Editor */}
          {!selected ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-ink-200 p-10 text-sm text-ink-400">
              {t("admin.regionForm.selectPage")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t("admin.regionForm.titleEn")}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <Input
                  label={t("admin.regionForm.titleAr")}
                  dir="rtl"
                  value={form.title_ar}
                  onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t("admin.regionForm.contentEn")}</label>
                <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} dir="ltr" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t("admin.regionForm.contentAr")}</label>
                <RichTextEditor value={form.content_ar} onChange={(html) => setForm((f) => ({ ...f, content_ar: html }))} dir="rtl" />
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="h-4 w-4 rounded border-ink-300 text-bloom-600"
                />
                {t("admin.regionForm.publishedLabel")}
              </label>

              <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4">
                <Button type="button" onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
                  {t("admin.common.saveChanges")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setConfirmLoadDefault(true)}>
                  {t("admin.regionForm.loadDefault")}
                </Button>
                {rowsBySlug.get(selected) ? (
                  <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-bloom-700">
                    {t("common.delete")}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmLoadDefault}
        title={t("admin.regionForm.loadDefault")}
        description={t("admin.regionForm.loadDefaultConfirm")}
        confirmLabel={t("admin.regionForm.loadDefault")}
        onConfirm={loadDefault}
        onClose={() => setConfirmLoadDefault(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title={t("common.delete")}
        description={t("admin.regionForm.deletePageConfirm")}
        confirmLabel={t("common.delete")}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
