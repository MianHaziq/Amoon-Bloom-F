"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { regionsApi } from "@/features/regions/api/regions.api";
import { queryKeys } from "@/services/queryKeys";
import { useT } from "@/i18n/useT";
import type { ApiDeliveryZoneBulkInput } from "@/features/delivery-zones/types";

interface Row {
  name: string;
  name_ar: string;
}

interface DeliveryZoneBulkFormProps {
  /** Pre-selects the region when creating from within a region's context. */
  defaultRegionId?: string;
  submitting?: boolean;
  onSubmit: (payload: ApiDeliveryZoneBulkInput) => Promise<void>;
}

const emptyRow = (): Row => ({ name: "", name_ar: "" });

const inputClass =
  "h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 focus:border-bloom-400 focus:outline-none focus:ring-4 focus:ring-bloom-100";

/**
 * Create MULTIPLE delivery zones for one region at once — a region picker plus a
 * repeatable list of name / Arabic-name rows. sortOrder is not set here: the
 * server appends new zones, and the admin reorders by drag-and-drop on the list.
 */
export function DeliveryZoneBulkForm({
  defaultRegionId,
  submitting,
  onSubmit,
}: DeliveryZoneBulkFormProps) {
  const { t } = useT();
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
  });

  const [regionId, setRegionId] = useState(defaultRegionId ?? "");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [errors, setErrors] = useState<{ region?: string; rows?: string }>({});

  const cleaned = useMemo(
    () =>
      rows
        .map((r) => ({ name: r.name.trim(), name_ar: r.name_ar.trim() }))
        .filter((r) => r.name),
    [rows]
  );

  const updateRow = (i: number, field: keyof Row, value: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: { region?: string; rows?: string } = {};
    if (!regionId) next.region = t("admin.deliveryZoneForm.regionRequired");
    if (cleaned.length === 0) next.rows = t("admin.deliveryZoneForm.atLeastOneZone");
    setErrors(next);
    if (next.region || next.rows) return;
    await onSubmit({
      regionId,
      zones: cleaned.map((r) => ({ name: r.name, name_ar: r.name_ar || null })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <div className="mb-5 max-w-sm">
          <label
            htmlFor="bulk-region"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            {t("admin.deliveryZoneForm.regionLabel")}
          </label>
          {regionsQuery.isPending ? (
            <div className="flex h-12 items-center rounded-2xl border border-ink-200 px-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              id="bulk-region"
              className={inputClass}
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              <option value="">{t("admin.deliveryZoneForm.selectRegion")}</option>
              {regionsQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          )}
          {errors.region ? (
            <p className="mt-1 text-xs text-bloom-700">{errors.region}</p>
          ) : null}
        </div>

        <h3 className="mb-1 font-display text-lg text-ink-900">
          {t("admin.deliveryZoneForm.zonesHeading")}
        </h3>
        <p className="mb-4 text-xs text-ink-500">
          {t("admin.deliveryZoneForm.zonesHint")}
        </p>

        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm tabular-nums text-ink-400">
                {i + 1}.
              </span>
              <input
                className={inputClass}
                placeholder={t("admin.deliveryZoneForm.namePlaceholder")}
                value={row.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
              />
              <input
                className={inputClass}
                dir="rtl"
                placeholder={t("admin.deliveryZoneForm.nameArPlaceholder")}
                value={row.name_ar}
                onChange={(e) => updateRow(i, "name_ar", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                aria-label={t("admin.deliveryZoneForm.removeRow")}
                className="shrink-0 rounded-md p-2 text-bloom-700 hover:bg-bloom-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
        {errors.rows ? (
          <p className="mt-2 text-xs text-bloom-700">{errors.rows}</p>
        ) : null}

        <button
          type="button"
          onClick={addRow}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-bloom-700 hover:text-bloom-800"
        >
          <PlusIcon size={16} /> {t("admin.deliveryZoneForm.addRow")}
        </button>
      </section>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          isLoading={submitting}
          disabled={cleaned.length === 0}
        >
          {t("admin.deliveryZoneForm.bulkSubmit")}
        </Button>
      </div>
    </form>
  );
}
