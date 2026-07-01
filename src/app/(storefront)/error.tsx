"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { AlertIcon, ArrowRight } from "@/components/icons";
import { useT } from "@/i18n/useT";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function StorefrontError({ error, unstable_retry }: ErrorProps) {
  const { t } = useT();
  useEffect(() => {
    // Surface to whatever logging the host provides (Sentry, Vercel, etc.).
    console.error("[storefront]", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <AlertIcon size={32} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
        {t("error.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
        {t("error.title")}
      </h1>
      <p className="mt-4 max-w-lg text-base text-ink-600">
        {t("error.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          onClick={unstable_retry}
          trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}
        >
          {t("error.retry")}
        </Button>
        <Link href="/" className="contents">
          <Button size="lg" variant="outline">
            {t("error.backHome")}
          </Button>
        </Link>
      </div>
    </Container>
  );
}
