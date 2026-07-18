import type { ApiOrderListRow } from "@/features/orders/types";

/** Registered customer's name, or a guest order's contact-snapshot name. */
export function customerName(o: ApiOrderListRow): string {
  if (o.user) {
    const composed = [o.user.firstName, o.user.lastName]
      .filter(Boolean)
      .join(" ");
    return o.user.fullName || composed || "";
  }
  // Guest order — no linked account; use the contact snapshot.
  return o.guestName || "";
}

export function customerEmail(o: ApiOrderListRow): string | null {
  return o.user?.email || o.guestEmail || null;
}

export function customerLabel(o: ApiOrderListRow): string {
  return customerName(o) || customerEmail(o) || "—";
}

export function isGuestOrder(o: ApiOrderListRow): boolean {
  return !o.user;
}
