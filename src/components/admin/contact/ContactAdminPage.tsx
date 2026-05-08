"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { contactApi } from "@/features/contact/api/contact.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
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
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [status, setStatus] = useState<ContactStatus | "ALL">("ALL");

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

  const statsQuery = useQuery({
    queryKey: queryKeys.contact.stats(),
    queryFn: () => contactApi.stats(),
  });

  const columns: Column<ApiContactMessage>[] = [
    {
      key: "from",
      header: "From",
      cell: (m) => (
        <div>
          <p className="font-medium text-ink-900">
            {m.firstName}
            {m.lastName ? ` ${m.lastName}` : ""}
          </p>
          <p className="text-xs text-ink-500">{m.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (m) => (
        <span className="capitalize text-ink-700">{m.subject || "general"}</span>
      ),
    },
    {
      key: "preview",
      header: "Message",
      cell: (m) => (
        <p className="line-clamp-1 max-w-md text-sm text-ink-500">{m.message}</p>
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
        description="Customer enquiries from the website contact form."
      />

      {/* Stats */}
      {statsQuery.data ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {(
            [
              { label: "All", value: statsQuery.data.total, status: "ALL" as const },
              { label: "New", value: statsQuery.data.NEW, status: "NEW" as ContactStatus },
              { label: "Replied", value: statsQuery.data.REPLIED, status: "REPLIED" as ContactStatus },
              { label: "Archived", value: statsQuery.data.ARCHIVED, status: "ARCHIVED" as ContactStatus },
            ]
          ).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setStatus(s.status);
                setPage(1);
              }}
              className={
                "rounded-xl border px-4 py-3 text-left transition-colors " +
                (status === s.status
                  ? "border-bloom-500 bg-bloom-50"
                  : "border-ink-100 bg-white hover:border-ink-200")
              }
            >
              <p className="text-xs uppercase tracking-wider text-ink-500">{s.label}</p>
              <p className="mt-1 font-display text-xl text-ink-900">{s.value}</p>
            </button>
          ))}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(m) => m.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        onRowClick={(m) => router.push(`/admin/contact/${m.id}`)}
        toolbar={
          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 sm:max-w-sm">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder="Search by name, email, message"
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
    </div>
  );
}
