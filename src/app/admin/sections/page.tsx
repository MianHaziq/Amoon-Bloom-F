import type { Metadata } from "next";
import { SectionsAdminPage } from "@/components/admin/sections/SectionsAdminPage";

export const metadata: Metadata = { title: "Sections · Admin" };

export default function SectionsPage() {
  return <SectionsAdminPage />;
}
