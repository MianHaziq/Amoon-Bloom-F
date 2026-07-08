"use client";

import { Modal } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useT } from "@/i18n/useT";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useT();
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description ? (
        <p className="mb-5 text-sm text-ink-600">{description}</p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel ?? t("common.cancel")}
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          onClick={onConfirm}
          isLoading={loading}
        >
          {confirmLabel ?? t("admin.common.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
