"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { AlertIcon, ArrowRight } from "@/components/icons";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function AdminError({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <AlertIcon size={28} />
      </span>
      <h2 className="mt-5 font-display text-2xl text-ink-900">
        Something went wrong in the admin panel.
      </h2>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        The page hit an unexpected error. Retry usually clears it; if not, the
        backend may be unavailable.
      </p>
      {error?.digest ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-400">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button
          size="md"
          onClick={unstable_retry}
          trailingIcon={<ArrowRight size={14} />}
        >
          Try again
        </Button>
        <Link href="/admin" className="contents">
          <Button size="md" variant="outline">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
