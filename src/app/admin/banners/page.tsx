import type { Metadata } from "next";
import { BannersAdminPage } from "@/components/admin/banners/BannersAdminPage";

export const metadata: Metadata = { title: "Banners · Admin" };

export default function BannersPage() {
  return <BannersAdminPage />;
}
