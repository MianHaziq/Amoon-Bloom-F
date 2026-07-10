import { OrderReceipt } from "@/components/checkout/OrderReceipt";
import { GuestOrderSuccess } from "@/components/checkout/GuestOrderSuccess";

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage(
  props: PageProps<"/order/success">
) {
  const search = await props.searchParams;
  const orderId = typeof search?.id === "string" ? search.id : undefined;
  // Guest checkout redirects here with `?guest=1`. Guests can't refetch the order
  // (GET /orders/:id is authenticated), so the guest experience renders from the
  // order stashed at checkout and encourages creating an account.
  const isGuest = search?.guest === "1";

  if (isGuest) return <GuestOrderSuccess />;
  return <OrderReceipt orderId={orderId} />;
}
