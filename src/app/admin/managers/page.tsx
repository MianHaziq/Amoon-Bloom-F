import type { Metadata } from "next";
import { ManagersAdminPage } from "@/components/admin/managers/ManagersAdminPage";

export const metadata: Metadata = { title: "Managers · Admin" };

export default function ManagersPage() {
  return <ManagersAdminPage />;
}
