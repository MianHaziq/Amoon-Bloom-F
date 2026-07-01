"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { contactApi } from "@/features/contact/api/contact.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge, Drawer } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/format";
import { SearchIcon } from "@/components/icons";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABEL,
  CONTACT_STATUS_TONE,
} from "./contactStatus";
import type { ApiContactMessage, ContactStatus } from "@/features/contact/types";

const PAGE_SIZE = 20;

export function ContactAdminPage() {
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
      header: "From",
      cell: (m) => (
        <div>
          <p className="font-medium text-ink-900">{m.user?.fullName ?? "—"}</p>
          <p className="text-xs text-ink-500">{m.user?.email ?? "Unknown user"}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (m) => <span className="text-ink-700">{m.subject || "—"}</span>,
    },
    {
      key: "preview",
      header: "Message",
      cell: (m) => (
        <p className="line-clamp-1 max-w-40 text-sm text-ink-500 sm:max-w-64">{m.message}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <Badge tone={CONTACT_STATUS_TONE[m.status]}>
          {CONTACT_STATUS_LABEL[m.status]}
        </Badge>
      ),
    },
    {
      key: "received",
      header: "Received",
      cell: (m) => <span className="text-ink-500">{formatDate(m.createdAt)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Contact messages"
        description="Customer enquiries submitted from the app. Read-only — reply via the customer's email."
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
                placeholder="Search by name, email, subject, message"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ContactStatus | "ALL");
                setPage(1);
              }}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm"
            >
              <option value="ALL">All statuses</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONTACT_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
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
        title={selected?.subject || "Message"}
        description={selected ? formatDate(selected.createdAt) : undefined}
      >
        {selected ? (
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="flex items-center gap-2">
              <Badge tone={CONTACT_STATUS_TONE[selected.status]}>
                {CONTACT_STATUS_LABEL[selected.status]}
              </Badge>
            </div>

            <div className="rounded-xl border border-ink-100 bg-cream-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                From
              </p>
              <p className="mt-1 font-medium text-ink-900">
                {selected.user?.fullName ?? "Unknown user"}
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
                Message
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
