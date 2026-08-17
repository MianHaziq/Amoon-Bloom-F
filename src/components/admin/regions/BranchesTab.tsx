"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Button, Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { branchesApi } from "@/features/regions/api/branches.api";
import type { ApiBranch, ApiRegion, BranchCreateInput } from "@/features/regions/types";
import { revalidateCatalog } from "@/services/revalidateCatalog";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";

interface BranchForm {
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  phone: string;
  hours: string;
  hours_ar: string;
  note: string;
  note_ar: string;
  mapUrl: string;
  isActive: boolean;
}

const EMPTY: BranchForm = {
  name: "", name_ar: "", address: "", address_ar: "", phone: "",
  hours: "", hours_ar: "", note: "", note_ar: "", mapUrl: "", isActive: true,
};

function fromBranch(b: ApiBranch): BranchForm {
  return {
    name: b.name ?? "", name_ar: b.name_ar ?? "", address: b.address ?? "", address_ar: b.address_ar ?? "",
    phone: b.phone ?? "", hours: b.hours ?? "", hours_ar: b.hours_ar ?? "", note: b.note ?? "",
    note_ar: b.note_ar ?? "", mapUrl: b.mapUrl ?? "", isActive: b.isActive,
  };
}

function toPayload(f: BranchForm): Omit<BranchCreateInput, "regionId"> {
  const s = (v: string) => v.trim() || null;
  return {
    name: f.name.trim(),
    name_ar: s(f.name_ar), address: s(f.address), address_ar: s(f.address_ar), phone: s(f.phone),
    hours: s(f.hours), hours_ar: s(f.hours_ar), note: s(f.note), note_ar: s(f.note_ar),
    mapUrl: s(f.mapUrl), isActive: f.isActive,
  };
}

export function BranchesTab({ region }: { region: ApiRegion }) {
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  // `editing` = branch id being edited, "new" for the add form, or null (closed).
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<BranchForm>(EMPTY);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["region-branches", region.code],
    queryFn: () => branchesApi.list(region.code),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["region-branches", region.code] });
    revalidateCatalog(["regions"]);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editing === "new"
        ? branchesApi.create({ regionId: region.id, ...toPayload(form) })
        : branchesApi.update(editing as string, toPayload(form)),
    onSuccess: () => {
      toast.success({ title: t("admin.regionForm.branchSaved") });
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.fromError(t("admin.regionForm.branchSaveError"), err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchesApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.regionForm.branchDeleted") });
      setConfirmDeleteId(null);
      invalidate();
    },
    onError: (err) => toast.fromError(t("admin.regionForm.branchDeleteError"), err),
  });

  const openNew = () => {
    setForm(EMPTY);
    setEditing("new");
  };
  const openEdit = (b: ApiBranch) => {
    setForm(fromBranch(b));
    setEditing(b.id);
  };

  const set = (k: keyof BranchForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink-900">{t("admin.regionForm.branchesHeading")}</h3>
          <p className="mt-1 text-xs text-ink-500">{t("admin.regionForm.branchesHint")}</p>
        </div>
        {editing === null ? (
          <Button type="button" variant="secondary" onClick={openNew} className="shrink-0">
            {t("admin.regionForm.branchAdd")}
          </Button>
        ) : null}
      </div>

      {editing !== null ? (
        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t("admin.regionForm.branchName")} value={form.name} onChange={set("name")} />
            <Input label={`${t("admin.regionForm.branchName")} (AR)`} dir="rtl" value={form.name_ar} onChange={set("name_ar")} />
            <Input label={t("admin.regionForm.branchAddress")} value={form.address} onChange={set("address")} />
            <Input label={`${t("admin.regionForm.branchAddress")} (AR)`} dir="rtl" value={form.address_ar} onChange={set("address_ar")} />
            <Input label={t("admin.regionForm.branchPhone")} value={form.phone} onChange={set("phone")} placeholder="+966 5x xxx xxxx" />
            <Input label={t("admin.regionForm.branchMapUrl")} value={form.mapUrl} onChange={set("mapUrl")} placeholder="https://maps.google.com/…" />
            <Input label={t("admin.regionForm.branchHours")} value={form.hours} onChange={set("hours")} placeholder="Daily · 10:00 — 22:00" />
            <Input label={`${t("admin.regionForm.branchHours")} (AR)`} dir="rtl" value={form.hours_ar} onChange={set("hours_ar")} />
            <Input label={t("admin.regionForm.branchNote")} value={form.note} onChange={set("note")} />
            <Input label={`${t("admin.regionForm.branchNote")} (AR)`} dir="rtl" value={form.note_ar} onChange={set("note_ar")} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-300 text-bloom-600"
            />
            {t("admin.regionForm.branchActive")}
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
              disabled={!form.name.trim()}
            >
              {t("admin.common.saveChanges")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        {listQuery.isPending ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (listQuery.data ?? []).length === 0 ? (
          editing === null ? <p className="py-6 text-sm text-ink-400">{t("admin.regionForm.branchEmpty")}</p> : null
        ) : (
          <ul className="flex flex-col gap-2">
            {(listQuery.data ?? []).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900">
                    {b.name}
                    {!b.isActive ? <span className="ml-2 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] uppercase text-ink-500">{t("admin.regionForm.branchInactive")}</span> : null}
                  </p>
                  {b.hours ? <p className="truncate text-xs text-ink-500">{b.hours}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" variant="ghost" onClick={() => openEdit(b)}>
                    {t("common.edit")}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setConfirmDeleteId(b.id)} className="text-bloom-700">
                    {t("common.delete")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t("common.delete")}
        description={t("admin.regionForm.branchDeleteConfirm")}
        confirmLabel={t("common.delete")}
        loading={deleteMutation.isPending}
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
