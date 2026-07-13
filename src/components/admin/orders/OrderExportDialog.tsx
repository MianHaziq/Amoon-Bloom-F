"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal, Input, Card } from "@/components/ui";
import { Spinner } from "@/components/ui/Loader";
import { Select } from "@/components/admin/Select";
import { CalendarIcon, DocumentIcon, SpreadsheetIcon } from "@/components/icons";
import { ordersApi } from "@/features/orders/api/orders.api";
import { downloadBlob } from "@/lib/download";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/cn";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_KEY,
} from "./orderStatus";
import type { MessageKey } from "@/i18n";
import type { OrderStatus, PaymentStatus } from "@/features/orders/types";

const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "FAILED"];

type ExportFormat = "xlsx" | "pdf" | "csv";

const FORMATS: {
  value: ExportFormat;
  extension: string;
  labelKey: MessageKey;
  icon: typeof DocumentIcon;
  tone: "green" | "red" | "blue";
}[] = [
  { value: "xlsx", extension: ".XLSX", labelKey: "admin.ordersPage.exportExcel", icon: SpreadsheetIcon, tone: "green" },
  { value: "pdf", extension: ".PDF", labelKey: "admin.ordersPage.exportPdf", icon: DocumentIcon, tone: "red" },
  { value: "csv", extension: ".CSV", labelKey: "admin.ordersPage.exportCsv", icon: SpreadsheetIcon, tone: "blue" },
];

const TONE_STYLES: Record<(typeof FORMATS)[number]["tone"], string> = {
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-rose-50 text-rose-600",
  blue: "bg-sky-50 text-sky-600",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Formats a Date as a `datetime-local` input value in the browser's local time. */
function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `datetime-local` values have no timezone — treat as local time, convert to a real instant. */
function toIsoOrNull(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function defaultRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return { start: toDatetimeLocalValue(start), end: toDatetimeLocalValue(now) };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
      {children}
    </label>
  );
}

interface OrderExportDialogProps {
  open: boolean;
  onClose: () => void;
  /** Inherit the on-screen list filters as sensible export defaults. */
  initialStatus: OrderStatus | "ALL";
  initialRegion: string;
  regionOptions: { value: string; label: string }[];
}

export function OrderExportDialog({
  open,
  onClose,
  initialStatus,
  initialRegion,
  regionOptions,
}: OrderExportDialogProps) {
  const { t } = useT();
  const toast = useToast();
  const defaults = useMemo(() => defaultRange(), []);

  const [startAt, setStartAt] = useState(defaults.start);
  const [endAt, setEndAt] = useState(defaults.end);
  const [status, setStatus] = useState<OrderStatus | "ALL">(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [region, setRegion] = useState(initialRegion);

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      const dateFrom = toIsoOrNull(startAt);
      const dateTo = toIsoOrNull(endAt);
      if (!dateFrom || !dateTo) {
        throw new Error(t("admin.ordersPage.exportDateRequired"));
      }
      return ordersApi.exportFile({
        dateFrom,
        dateTo,
        ...(status === "ALL" ? {} : { status }),
        ...(paymentStatus === "ALL" ? {} : { paymentStatus }),
        ...(region === "ALL" ? {} : { region }),
        format,
      });
    },
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename);
      toast.success({ title: t("admin.ordersPage.exportSuccess") });
      onClose();
    },
    onError: (err) => {
      toast.fromError(t("admin.ordersPage.exportError"), err);
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("admin.ordersPage.exportButton")}
      description={t("admin.ordersPage.exportDialogDescription")}
      size="md"
    >
      <div className="flex flex-col gap-5">
        {/* Date range */}
        <Card variant="ghost" padding="sm" className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-ink-700">
            <CalendarIcon size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("admin.ordersPage.dateRangeHeading")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="datetime-local"
              label={t("admin.ordersPage.startDate")}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              containerClassName="min-w-0"
              className="min-w-0"
            />
            <Input
              type="datetime-local"
              label={t("admin.ordersPage.endDate")}
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              containerClassName="min-w-0"
              className="min-w-0"
            />
          </div>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t("admin.status")}</FieldLabel>
            <Select
              value={status}
              onChange={(v) => setStatus(v as OrderStatus | "ALL")}
              aria-label={t("admin.status")}
              className="w-full"
              options={[
                { value: "ALL", label: t("admin.ordersPage.allOption") },
                ...ORDER_STATUSES.map((s) => ({ value: s, label: t(ORDER_STATUS_LABEL_KEY[s]) })),
              ]}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t("admin.ordersPage.paymentStatus")}</FieldLabel>
            <Select
              value={paymentStatus}
              onChange={(v) => setPaymentStatus(v as PaymentStatus | "ALL")}
              aria-label={t("admin.ordersPage.paymentStatus")}
              className="w-full"
              options={[
                { value: "ALL", label: t("admin.ordersPage.allOption") },
                ...PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t("admin.ordersPage.columnRegion")}</FieldLabel>
            <Select
              value={region}
              onChange={setRegion}
              aria-label={t("admin.ordersPage.columnRegion")}
              className="w-full"
              options={[
                { value: "ALL", label: t("admin.ordersPage.allRegionsOption") },
                ...regionOptions,
              ]}
            />
          </div>
        </div>

        {/* Format picker */}
        <div className="flex flex-col gap-3 border-t border-ink-100 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {t("admin.ordersPage.exportFormatHeading")}
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FORMATS.map((f) => {
              const isThisPending = exportMutation.isPending && exportMutation.variables === f.value;
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  type="button"
                  disabled={exportMutation.isPending}
                  onClick={() => exportMutation.mutate(f.value)}
                  className={cn(
                    "group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-5 text-center transition-all",
                    "hover:-translate-y-0.5 hover:border-bloom-300 hover:shadow-(--shadow-soft)",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bloom-100",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl",
                      TONE_STYLES[f.tone]
                    )}
                  >
                    {isThisPending ? <Spinner size="sm" /> : <Icon size={22} />}
                  </span>
                  <span className="text-sm font-medium text-ink-900">{t(f.labelKey)}</span>
                  <span className="text-[10px] font-semibold tracking-wider text-ink-400">
                    {f.extension}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
