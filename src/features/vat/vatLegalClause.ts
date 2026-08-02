import type { ApiPublicVatConfig } from "./types";

export type VatClauseKind = "disabled" | "inclusive" | "exclusive";

/**
 * Classifies a region's public VAT config into one of 3 legal-copy branches —
 * mirrors vatHint()'s enabled/rate gate (see vatDisplay.ts), but for prose
 * rendering on legal pages (Terms & Conditions, Shipping Policy) rather than a
 * price-tag hint. A disabled or 0%-rate region gets "disabled" so those pages
 * don't assert an inclusive/exclusive VAT treatment that doesn't apply.
 */
export function vatClauseKind(vat: ApiPublicVatConfig | null | undefined): VatClauseKind {
  if (!vat || !vat.enabled || !(vat.ratePercent > 0)) return "disabled";
  return vat.inclusive ? "inclusive" : "exclusive";
}

/**
 * Terms & Conditions' "Products & Availability" VAT sentence. Single source of
 * truth shared by the storefront page (`terms/page.tsx`) AND the admin Region
 * form's "how it reads on the storefront" preview — both call this exact
 * function, so they can never drift the way a hand-copied example string would.
 * Returns `[english, arabic]`; `currencyDisplayName`/`vatLawName` are expected
 * already resolved to whichever of those two languages the caller wants.
 */
export function termsVatClause(
  vat: ApiPublicVatConfig | null | undefined,
  currencyDisplayName: string,
  vatLawName: string
): [string, string] {
  switch (vatClauseKind(vat)) {
    case "disabled":
      return [
        `Prices are displayed in ${currencyDisplayName}.`,
        `تعرض الأسعار ب${currencyDisplayName}.`,
      ];
    case "inclusive":
      return [
        `Prices are displayed in ${currencyDisplayName} and are inclusive of VAT where applicable, in accordance with ${vatLawName}.`,
        `تعرض الأسعار ب${currencyDisplayName} وتشمل ضريبة القيمة المضافة حيثما ينطبق ذلك، بموجب ${vatLawName}.`,
      ];
    case "exclusive":
      return [
        `Prices are displayed in ${currencyDisplayName} and are exclusive of VAT where applicable. Applicable VAT is added at checkout in accordance with ${vatLawName}.`,
        `تعرض الأسعار ب${currencyDisplayName} ولا تشمل ضريبة القيمة المضافة حيثما ينطبق ذلك. تضاف ضريبة القيمة المضافة المستحقة عند إتمام الطلب بموجب ${vatLawName}.`,
      ];
  }
}

/**
 * Shipping Policy's "Product Prices & VAT" sentence — same classifier as
 * `termsVatClause`, richer wording (also describes the checkout order-total
 * breakdown, which itself differs: exclusive shows VAT as a separate line,
 * inclusive doesn't — see project_vat_display memory's display convention).
 * Shared by `shipping-policy/page.tsx` and the admin Region form's preview.
 */
export function shippingVatClause(
  vat: ApiPublicVatConfig | null | undefined,
  currencyDisplayName: string,
  vatLawName: string
): [string, string] {
  switch (vatClauseKind(vat)) {
    case "disabled":
      return [
        `All product prices displayed on our website are listed in ${currencyDisplayName}.`,
        `تعرض جميع أسعار المنتجات على موقعنا ب${currencyDisplayName}.`,
      ];
    case "inclusive":
      return [
        `All product prices displayed on our website are listed in ${currencyDisplayName} and are inclusive of VAT where applicable, in accordance with ${vatLawName}. Your order total at checkout will show the product subtotal and delivery charges, with VAT already included in the displayed prices.`,
        `تعرض جميع أسعار المنتجات على موقعنا ب${currencyDisplayName} وتشمل ضريبة القيمة المضافة حيثما ينطبق ذلك، بموجب ${vatLawName}. سيوضح إجمالي طلبك عند إتمام الشراء إجمالي المنتجات ورسوم التوصيل، مع احتساب ضريبة القيمة المضافة ضمن الأسعار المعروضة.`,
      ];
    case "exclusive":
      return [
        `All product prices displayed on our website are listed in ${currencyDisplayName} and are exclusive of VAT where applicable. Applicable VAT is calculated and added at checkout before you complete your order, in accordance with ${vatLawName}. Your order total at checkout will show the product subtotal, delivery charges, and VAT separately where applicable.`,
        `تعرض جميع أسعار المنتجات على موقعنا ب${currencyDisplayName} ولا تشمل ضريبة القيمة المضافة حيثما ينطبق ذلك. يتم احتساب ضريبة القيمة المضافة المستحقة وإضافتها عند إتمام الطلب قبل إكمال طلبك، بموجب ${vatLawName}. سيوضح إجمالي طلبك عند إتمام الشراء إجمالي المنتجات ورسوم التوصيل وضريبة القيمة المضافة بشكل منفصل حيثما ينطبق ذلك.`,
      ];
  }
}
