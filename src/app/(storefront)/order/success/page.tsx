import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { CheckCircleIcon, ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage(
  props: PageProps<"/order/success">
) {
  const search = await props.searchParams;
  const orderId = typeof search?.id === "string" ? search.id : undefined;
  const trackHref = orderId ? `/account/orders/${orderId}` : ROUTES.orders;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <CheckCircleIcon size={32} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
        Thank you
      </p>
      <h1 className="mt-2 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
        Your order is composed.
      </h1>
      {orderId ? (
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-ink-500">
          Order #{orderId.slice(0, 8)}
        </p>
      ) : null}
      <p className="mt-4 max-w-lg text-base text-ink-600">
        We&rsquo;ve received your order and our florists are getting to work.
        You&rsquo;ll receive a confirmation by email and SMS within minutes
        &mdash; and a delivery update as soon as it leaves the boutique.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.shop} className="contents">
          <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
            Continue shopping
          </Button>
        </Link>
        <Link href={trackHref} className="contents">
          <Button size="lg" variant="outline">
            Track this order
          </Button>
        </Link>
      </div>
    </Container>
  );
}
