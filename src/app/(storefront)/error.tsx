"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { AlertIcon, ArrowRight } from "@/components/icons";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function StorefrontError({ error, unstable_retry }: ErrorProps) {
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
        Something went wrong
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
        We couldn&apos;t load this page.
      </h1>
      <p className="mt-4 max-w-lg text-base text-ink-600">
        A temporary glitch interrupted the page. Try again — most issues clear
        on refresh. If it keeps happening, our concierge can help.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          onClick={unstable_retry}
          trailingIcon={<ArrowRight size={16} />}
        >
          Try again
        </Button>
        <Link href="/" className="contents">
          <Button size="lg" variant="outline">
            Back to home
          </Button>
        </Link>
      </div>
    </Container>
  );
}
