"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/features/contact/api/contact.api";
import { queryKeys } from "@/services/queryKeys";
import { Badge, Button, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Spinner } from "@/components/ui/Loader";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABEL,
  CONTACT_STATUS_TONE,
} from "./contactStatus";
import type { ContactStatus } from "@/features/contact/types";

export function ContactDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState(false);

  const detailQuery = useQuery({
    queryKey: queryKeys.contact.detail(id),
    queryFn: () => contactApi.getById(id),
  });

  const setStatusMutation = useMutation({
    mutationFn: (status: ContactStatus) => contactApi.setStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.contact.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
      toast.success({
        title: "Status updated",
        description: CONTACT_STATUS_LABEL[updated.status],
      });
    },
    onError: (err) => toast.fromError("Could not update status", err),
  });

  const setNoteMutation = useMutation({
    mutationFn: (n: string) => contactApi.setNote(id, n),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.contact.detail(id), updated);
      toast.success({ title: "Note saved" });
    },
    onError: (err) => toast.fromError("Could not save note", err),
  });

  const deleteMutation = useMutation({
    mutationFn: () => contactApi.remove(id),
    onSuccess: () => {
      toast.success({ title: "Message deleted" });
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
      router.replace("/admin/contact");
    },
    onError: (err) => toast.fromError("Could not delete message", err),
  });

  if (detailQuery.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="rounded-xl border border-bloom-200 bg-bloom-50 p-6 text-bloom-700">
        Could not load this message.
      </div>
    );
  }

  const m = detailQuery.data;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Message from ${m.firstName}`}
        description={`Received ${formatDate(m.createdAt)}`}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contact", href: "/admin/contact" },
          { label: m.firstName },
        ]}
        actions={
          <Badge tone={CONTACT_STATUS_TONE[m.status]}>
            {CONTACT_STATUS_LABEL[m.status]}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-display text-lg text-ink-900">Message</h3>
            <p className="whitespace-pre-wrap text-sm text-ink-800">{m.message}</p>
          </section>

          <NoteEditor
            key={m.id}
            initialNote={m.adminNote ?? ""}
            saving={setNoteMutation.isPending}
            onSave={(n) => setNoteMutation.mutate(n)}
          />
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-2 font-display text-lg text-ink-900">From</h3>
            <p className="text-sm font-medium text-ink-900">
              {m.firstName}
              {m.lastName ? ` ${m.lastName}` : ""}
            </p>
            <p className="mt-1">
              <a
                href={`mailto:${m.email}`}
                className="text-sm text-bloom-700 hover:underline"
              >
                {m.email}
              </a>
            </p>
            {m.phone ? (
              <p className="mt-1 text-sm text-ink-700">{m.phone}</p>
            ) : null}
            <p className="mt-3 text-xs uppercase tracking-wider text-ink-400">
              Subject
            </p>
            <p className="capitalize text-ink-700">{m.subject || "general"}</p>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-display text-lg text-ink-900">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_STATUSES.map((s) => {
                const isCurrent = m.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isCurrent || setStatusMutation.isPending}
                    onClick={() => setStatusMutation.mutate(s)}
                    className={
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                      (isCurrent
                        ? "border-bloom-500 bg-bloom-50 text-bloom-700"
                        : "border-ink-200 text-ink-700 hover:bg-cream-50 disabled:opacity-50")
                    }
                  >
                    {CONTACT_STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-bloom-200 bg-bloom-50 p-5 sm:p-6">
            <h3 className="mb-1 font-display text-lg text-bloom-900">Danger zone</h3>
            <p className="mb-3 text-xs text-bloom-700">
              Permanently remove this message.
            </p>
            <Button variant="danger" onClick={() => setPendingDelete(true)} fullWidth>
              Delete message
            </Button>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={pendingDelete}
        title="Delete message?"
        description="This permanently removes the message and any internal note."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setPendingDelete(false)}
      />
    </div>
  );
}

interface NoteEditorProps {
  initialNote: string;
  saving: boolean;
  onSave: (note: string) => void;
}

/**
 * Self-contained note editor. Initialised once from `initialNote`, never
 * synced back from the parent — the parent remounts via `key={message.id}`
 * when navigating to a different message. Avoids effect-driven setState.
 */
function NoteEditor({ initialNote, saving, onSave }: NoteEditorProps) {
  const [note, setNote] = useState(initialNote);
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h3 className="mb-3 font-display text-lg text-ink-900">Internal note</h3>
      <Textarea
        rows={4}
        placeholder="Add a private note for your team."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => onSave(note)}
          isLoading={saving}
          disabled={note === initialNote}
        >
          Save note
        </Button>
      </div>
    </section>
  );
}
