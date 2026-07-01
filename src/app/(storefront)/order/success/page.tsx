import { OrderReceipt } from "@/components/checkout/OrderReceipt";

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage(
  props: PageProps<"/order/success">
) {
  const search = await props.searchParams;
  const orderId = typeof search?.id === "string" ? search.id : undefined;
  return <OrderReceipt orderId={orderId} />;
}
