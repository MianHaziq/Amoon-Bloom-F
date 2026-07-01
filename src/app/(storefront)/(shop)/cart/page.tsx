"use client";

import Link from "next/link";
import { Container, Section, Button } from "@/components/ui";
import { ArrowRight, BagIcon } from "@/components/icons";
import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { useCart } from "@/features/cart/hooks/useCart";
import { ROUTES } from "@/constants/routes";
import { useT } from "@/i18n/useT";

export default function CartPage() {
  const { items, itemCount } = useCart();
  const { t, tc } = useT();

  return (
    <>
      <section className="border-b border-ink-100 bg-cream-50 pt-12 pb-8 lg:pt-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {t("cart.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
            {t("cart.heading")}
          </h1>
          <p className="mt-2 text-ink-500">
            {itemCount > 0
              ? `${tc(itemCount, "units.itemOne", "units.itemOther")} ${t("cart.composedFor")}`
              : t("cart.beginPrompt")}
          </p>
        </Container>
      </section>

      <Section spacing="md">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-ink-200 bg-cream-50 px-6 py-16 text-center sm:py-24">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
              <BagIcon size={28} />
            </span>
            <div>
              <h2 className="font-display text-2xl text-ink-900">
                {t("cart.empty")}
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-500">
                {t("cart.emptyBody")}
              </p>
            </div>
            <Link href={ROUTES.shop} className="contents">
              <Button size="lg" trailingIcon={<ArrowRight size={16} className="rtl:-scale-x-100" />}>
                {t("common.browseBoutique")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  variant="page"
                />
              ))}
            </div>
            <CartSummary />
          </div>
        )}
      </Section>
    </>
  );
}
