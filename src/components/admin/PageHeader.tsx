import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, crumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-ink-400">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink-700">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-500">{c.label}</span>
                )}
                {i < crumbs.length - 1 ? <ChevronRight size={12} className="rtl:-scale-x-100" /> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h2 className="font-display text-2xl text-ink-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
