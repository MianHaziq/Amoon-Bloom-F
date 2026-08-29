import { OrderReceipt } from "@/components/checkout/OrderReceipt";
import { GuestOrderSuccess } from "@/components/checkout/GuestOrderSuccess";

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage(
  props: PageProps<"/[region]/[locale]/order/success">
) {
  const search = await props.searchParams;
  const orderId = typeof search?.id === "string" ? search.id : undefined;
  // Guest checkout redirects here with `?guest=1` (and, after an online payment,
  // `&id=<orderId>` appended by the backend callback). Guests can't refetch the full
  // order (GET /orders/:id is authenticated), so the guest experience renders item
  // detail from the order stashed at checkout, but reconciles the PAYMENT STATUS from
  // the public status endpoint so a paid order never stays "Unpaid".
  const isGuest = search?.guest === "1";

  if (isGuest) return <GuestOrderSuccess orderId={orderId} />;
  return <OrderReceipt orderId={orderId} />;
}
