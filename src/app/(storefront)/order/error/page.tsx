import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { AlertIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Order issue" };

export default async function OrderErrorPage(
  props: PageProps<"/order/error">
) {
  const search = await props.searchParams;
  const message =
    typeof search?.message === "string" ? search.message : undefined;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <AlertIcon size={32} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
        Almost there
      </p>
      <h1 className="mt-2 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
        We couldn&rsquo;t place that order.
      </h1>
      <p className="mt-4 max-w-lg text-base text-ink-600">
        {message
          ? message
          : "Something interrupted the checkout — your card was not charged and your cart is still saved. Please try again, or reach out and a member of our team will compose your order by hand."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.checkout} className="contents">
          <Button size="lg">Try again</Button>
        </Link>
        <Link href="/contact" className="contents">
          <Button size="lg" variant="outline">
            Contact concierge
          </Button>
        </Link>
      </div>
    </Container>
  );
}
