import type { Metadata } from "next";
import { RegionCreatePage } from "@/components/admin/regions/RegionCreatePage";

export const metadata: Metadata = { title: "New region · Admin" };

export default function NewRegionPage() {
  return <RegionCreatePage />;
}
