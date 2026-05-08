import type { Metadata } from "next";
import { SettingsAdminPage } from "@/components/admin/settings/SettingsAdminPage";

export const metadata: Metadata = { title: "Settings · Admin" };

export default function SettingsPage() {
  return <SettingsAdminPage />;
}
