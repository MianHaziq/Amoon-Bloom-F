import type { Metadata } from "next";
import { NotificationsBroadcastPage } from "@/components/admin/notifications/NotificationsBroadcastPage";

export const metadata: Metadata = { title: "Notifications · Admin" };

export default function NotificationsPage() {
  return <NotificationsBroadcastPage />;
}
