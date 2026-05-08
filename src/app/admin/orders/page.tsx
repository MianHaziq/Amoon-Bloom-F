import type { Metadata } from "next";
import { OrdersAdminPage } from "@/components/admin/orders/OrdersAdminPage";

export const metadata: Metadata = { title: "Orders · Admin" };

export default function OrdersPage() {
  return <OrdersAdminPage />;
}
