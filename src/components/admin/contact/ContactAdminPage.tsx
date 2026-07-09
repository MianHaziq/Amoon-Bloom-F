"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { contactApi } from "@/features/contact/api/contact.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge, Drawer } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { Select } from "@/components/admin/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/format";
import { SearchIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABEL_KEY,
  CONTACT_STATUS_TONE,
} from "./contactStatus";
import type { ApiContactMessage, ContactStatus } from "@/features/contact/types";

const PAGE_SIZE = 20;

export function ContactAdminPage() {
  const { t } = useT();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [status, setStatus] = useState<ContactStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<ApiContactMessage | null>(null);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(debounced ? { search: debounced } : {}),
    ...(status === "ALL" ? {} : { status }),
  };

  const query = useQuery({
    queryKey: queryKeys.contact.list(params),
    queryFn: () => contactApi.list(params),
  });

  const columns: Column<ApiContactMessage>[] = [
    {
      key: "from",
      header: t("admin.contactPage.columnFrom"),
      cell: (m) => (
        <div>
          <p className="font-medium text-ink-900">{m.user?.fullName ?? "—"}</p>
          <p className="text-xs text-ink-500">
            {m.user?.email ?? t("admin.contactPage.unknownUser")}
          </p>
        </div>
      ),
    },
    {
      key: "subject",
      header: t("admin.contactPage.columnSubject"),
      cell: (m) => <span className="text-ink-700">{m.subject || "—"}</span>,
    },
    {
      key: "preview",
      header: t("admin.contactPage.columnMessage"),
      cell: (m) => (
        <p className="line-clamp-1 max-w-40 text-sm text-ink-500 sm:max-w-64">{m.message}</p>
      ),
    },
    {
      key: "status",
      header: t("admin.status"),
      cell: (m) => (
        <Badge tone={CONTACT_STATUS_TONE[m.status]}>
          {t(CONTACT_STATUS_LABEL_KEY[m.status])}
        </Badge>
      ),
    },
    {
      key: "received",
      header: t("admin.contactPage.columnReceived"),
      cell: (m) => <span className="text-ink-500">{formatDate(m.createdAt)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.contactPage.title")}
        description={t("admin.contactPage.description")}
      />

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(m) => m.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        onRowClick={(m) => setSelected(m)}
        toolbar={
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 sm:max-w-sm">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder={t("admin.contactPage.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v as ContactStatus | "ALL");
                setPage(1);
              }}
              aria-label={t("admin.contactPage.allStatusesOption")}
              options={[
                { value: "ALL", label: t("admin.contactPage.allStatusesOption") },
                ...CONTACT_STATUSES.map((s) => ({
                  value: s,
                  label: t(CONTACT_STATUS_LABEL_KEY[s]),
                })),
              ]}
            />
          </div>
        }
        footer={
          <Pagination
            meta={query.data?.meta?.pagination}
            page={page}
            onChange={setPage}
          />
        }
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || t("admin.contactPage.columnMessage")}
        description={selected ? formatDate(selected.createdAt) : undefined}
      >
        {selected ? (
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="flex items-center gap-2">
              <Badge tone={CONTACT_STATUS_TONE[selected.status]}>
                {t(CONTACT_STATUS_LABEL_KEY[selected.status])}
              </Badge>
            </div>

            <div className="rounded-xl border border-ink-100 bg-cream-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {t("admin.contactPage.columnFrom")}
              </p>
              <p className="mt-1 font-medium text-ink-900">
                {selected.user?.fullName ?? t("admin.contactPage.unknownUser")}
              </p>
              {selected.user?.email ? (
                <a
                  href={`mailto:${selected.user.email}`}
                  className="text-sm text-bloom-700 hover:underline"
                >
                  {selected.user.email}
                </a>
              ) : null}
              {selected.user?.phone ? (
                <p className="mt-1 text-sm text-ink-600">{selected.user.phone}</p>
              ) : null}
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
                {t("admin.contactPage.columnMessage")}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                {selected.message}
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
