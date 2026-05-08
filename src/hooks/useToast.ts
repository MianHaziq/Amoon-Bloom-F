"use client";

import { useCallback } from "react";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { ApiError } from "@/services/http";

interface ToastBody {
  title: string;
  description?: string;
}

export function useToast() {
  const dispatch = useAppDispatch();

  const success = useCallback(
    (body: ToastBody) => dispatch(pushToast({ ...body, variant: "success" })),
    [dispatch]
  );
  const error = useCallback(
    (body: ToastBody) => dispatch(pushToast({ ...body, variant: "error" })),
    [dispatch]
  );
  const warning = useCallback(
    (body: ToastBody) => dispatch(pushToast({ ...body, variant: "warning" })),
    [dispatch]
  );
  const info = useCallback(
    (body: ToastBody) => dispatch(pushToast({ ...body, variant: "default" })),
    [dispatch]
  );

  /** Convenience: emit an error toast from a thrown value with a sensible message. */
  const fromError = useCallback(
    (title: string, err: unknown) => {
      const description =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : undefined;
      dispatch(pushToast({ title, description, variant: "error" }));
    },
    [dispatch]
  );

  return { success, error, warning, info, fromError };
}
