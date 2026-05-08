"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui";
import { ImageIcon } from "@/components/icons";

const PARTNERS = [
  { name: "Netflix", category: "Entertainment" },
  { name: "Maserati", category: "Automotive" },
  { name: "Gucci", category: "Fashion" },
];

/**
 * Placeholder admin page. Collaborations are still mock data on the mobile
 * app per the project flow doc; this page exists for parity so managers can
 * see the partner list and the route is reachable. CRUD wiring follows when
 * the backend exposes a `/collaborations` endpoint.
 */
export function CollaborationsAdminPage() {
  return (
    <>
      <PageHeader
        title="Collaborations"
        description="Brand partners surfaced on the storefront home. CRUD comes online once the backend collaborations endpoint ships."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Collaborations" }]}
      />

      <div className="rounded-2xl border border-ink-100 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <ImageIcon size={16} className="text-ink-400" />
            Read-only preview
          </div>
          <Badge tone="bloom">Mock data</Badge>
        </div>
        <ul className="divide-y divide-ink-100">
          {PARTNERS.map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{p.name}</p>
                <p className="text-xs text-ink-400">{p.category}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.12em] text-ink-400">
                Pending API
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
