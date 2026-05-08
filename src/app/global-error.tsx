"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

/**
 * Last-resort fallback when the root layout itself throws. Replaces every
 * provider above it, so it must render its own <html> / <body>. Keep it
 * minimal — no Tailwind classes, no providers, no shared components.
 */
export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfbf6",
          color: "#131110",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Something went seriously wrong.
          </h1>
          <p style={{ marginTop: 12, color: "#6b655a", fontSize: 15 }}>
            The application crashed. Refresh the page to recover. If the
            problem persists, contact support.
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              marginTop: 24,
              padding: "10px 22px",
              borderRadius: 999,
              border: "none",
              background: "#d4316d",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
