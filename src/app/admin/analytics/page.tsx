import type { Metadata } from "next";
import { AnalyticsAdminPage } from "@/components/admin/analytics/AnalyticsAdminPage";

export const metadata: Metadata = { title: "Analytics · Admin" };

export default function AnalyticsPage() {
  return <AnalyticsAdminPage />;
}
