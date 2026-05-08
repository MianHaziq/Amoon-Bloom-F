import type { Metadata } from "next";
import { CollaborationsAdminPage } from "@/components/admin/collaborations/CollaborationsAdminPage";

export const metadata: Metadata = { title: "Collaborations · Admin" };

export default function CollaborationsPage() {
  return <CollaborationsAdminPage />;
}
