import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ScrollManager } from "@/components/layout/ScrollManager";

export const metadata: Metadata = {
  title: "Admin · Amoon Bloom",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <ScrollManager />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
