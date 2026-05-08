import type { Metadata } from "next";
import { OrderDetailPage } from "@/components/admin/orders/OrderDetailPage";

export const metadata: Metadata = { title: "Order · Admin" };

export default async function AdminOrderDetailPage(
  props: PageProps<"/admin/orders/[id]">
) {
  const { id } = await props.params;
  return <OrderDetailPage id={id} />;
}
