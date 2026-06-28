import type { Metadata } from "next";
import { RegionsAdminPage } from "@/components/admin/regions/RegionsAdminPage";

export const metadata: Metadata = { title: "Regions · Admin" };

export default function RegionsPage() {
  return <RegionsAdminPage />;
}
