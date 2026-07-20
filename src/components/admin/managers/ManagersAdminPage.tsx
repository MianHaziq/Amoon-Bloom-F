"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/i18n/useT";
import type { ApiAdminUser, ManagerPermission } from "@/features/users/types";

const PAGE_SIZE = 20;
const MAX_CHIPS = 3;

export function ManagersAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState<ApiAdminUser | null>(null);
  const [pendingToggle, setPendingToggle] = useState<ApiAdminUser | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useT();

  const params = {
    page,
    limit: PAGE_SIZE,
    role: "MANAGER" as const,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const query = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
  });

  // Shared cache with UserForm — resolves permission KEYS to readable labels
  // ("DELIVERY_ZONES" → "Delivery zones") without a second network round-trip.
  const permsQuery = useQuery({
    queryKey: queryKeys.users.permissionsCatalog(),
    queryFn: () => usersApi.permissionsCatalog(),
    staleTime: 5 * 60_000,
  });
  const permLabel = useMemo(() => {
    const map = new Map((permsQuery.data ?? []).map((p) => [p.key, p.label]));
    return (key: ManagerPermission) => map.get(key) ?? key;
  }, [permsQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success({ title: t("admin.usersPage.toastDeleted") });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => toast.fromError(t("admin.usersPage.toastDeleteError"), err),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => usersApi.setStatus(id),
    onSuccess: () => {
      toast.success({ title: t("admin.usersPage.toastStatusUpdated") });
      setPendingToggle(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => toast.fromError(t("admin.usersPage.toastStatusError"), err),
  });

  const columns: Column<ApiAdminUser>[] = [
    {
      key: "manager",
      header: t("admin.managersPage.columnManager"),
      cell: (u) => (
        <div className="flex items-center gap-3">
          {u.avatar?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-100 text-xs font-semibold text-bloom-700">
              {(u.firstName?.[0] ?? "?") + (u.lastName?.[0] ?? "")}
            </span>
          )}
          <div className="min-w-0 max-w-56">
            <p className="truncate font-medium text-ink-900">{u.name}</p>
            <p className="truncate text-xs text-ink-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("admin.managersPage.columnTitle"),
      cell: (u) => (
        <span className="text-ink-700">
          {u.managerTitle?.trim() || t("admin.managersPage.noTitle")}
        </span>
      ),
    },
    {
      key: "permissions",
      header: t("admin.managersPage.columnPermissions"),
      cell: (u) => {
        const perms = u.managerPermissions ?? [];
        if (perms.length === 0) {
          return (
            <span className="text-xs text-ink-400">
              {t("admin.managersPage.noPermissions")}
            </span>
          );
        }
        const shown = perms.slice(0, MAX_CHIPS);
        const extra = perms.length - shown.length;
        return (
          <div className="flex max-w-72 flex-wrap gap-1">
            {shown.map((p) => (
              <Badge key={p} tone="bloom">
                {permLabel(p)}
              </Badge>
            ))}
            {extra > 0 ? <Badge tone="neutral">{`+${extra}`}</Badge> : null}
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("admin.status"),
      cell: (u) => (
        <Badge tone={u.status === "Active" ? "success" : "warning"}>{u.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "180px",
      cell: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setPendingToggle(u)}
            className="rounded-md px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            {u.status === "Active"
              ? t("admin.usersPage.deactivate")
              : t("admin.usersPage.activate")}
          </button>
          <Link
            href={`/admin/users/${u.id}/edit`}
            className="rounded-md p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label={t("common.edit")}
          >
            <PencilIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(u)}
            className="rounded-md p-2 text-bloom-700 hover:bg-bloom-50"
            aria-label={t("common.delete")}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("admin.managersPage.title")}
        description={t("admin.managersPage.description")}
        actions={
          <Link
            href="/admin/managers/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-bloom-600 px-5 text-sm font-medium text-white shadow-(--shadow-bloom) transition-colors hover:bg-bloom-700"
          >
            <PlusIcon size={16} />
            {t("admin.managersPage.newManager")}
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data?.data}
        rowKey={(u) => u.id}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        emptyDescription={t("admin.managersPage.empty")}
        toolbar={
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5">
              <SearchIcon size={16} className="text-ink-400" />
              <input
                placeholder={t("admin.managersPage.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("admin.usersPage.deleteTitle", { name: pendingDelete?.name ?? "" })}
        description={t("admin.usersPage.deleteDescription")}
        confirmLabel={t("admin.usersPage.deleteConfirm")}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={
          pendingToggle?.status === "Active"
            ? t("admin.usersPage.deactivateTitle", { name: pendingToggle?.name ?? "" })
            : t("admin.usersPage.activateTitle", { name: pendingToggle?.name ?? "" })
        }
        description={
          pendingToggle?.status === "Active"
            ? t("admin.usersPage.deactivateDescription")
            : t("admin.usersPage.activateDescription")
        }
        confirmLabel={
          pendingToggle?.status === "Active"
            ? t("admin.usersPage.deactivate")
            : t("admin.usersPage.activate")
        }
        loading={toggleStatusMutation.isPending}
        onConfirm={() => pendingToggle && toggleStatusMutation.mutate(pendingToggle.id)}
        onClose={() => setPendingToggle(null)}
      />
    </div>
  );
}
