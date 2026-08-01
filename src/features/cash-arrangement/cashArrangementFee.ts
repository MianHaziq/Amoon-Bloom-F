/**
 * Pure client-side preview of the cash-arrangement fee — mirrors the EXACT backend formula
 * in Amoonis-Boutique-B/src/utils/cashArrangementMath.js (computeCashArrangementFee),
 * deliberately duplicated so the checkout fee updates live as the customer types/picks an
 * amount, without a per-keystroke network round trip. Same pattern already used for the
 * VAT/delivery-fee live checkout previews in this codebase. The backend recomputes
 * authoritatively at order-creation time regardless of what this preview shows.
 *
 * Verified against the confirmed worked examples (step=100, margin=20%):
 * 100->20, 101->40, 350->80, 570->120.
 */

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface CashArrangementFeeSchedule {
  feeStepAmount: number;
  feeMarginPercent: number;
}

export function computeCashArrangementFee(
  cashAmount: number,
  schedule: CashArrangementFeeSchedule | null | undefined
): number {
  if (!Number.isFinite(cashAmount) || cashAmount <= 0) return 0;
  if (!schedule) return 0;
  const { feeStepAmount: step, feeMarginPercent: margin } = schedule;
  if (!Number.isFinite(step) || step <= 0) return 0;
  if (!Number.isFinite(margin) || margin < 0) return 0;

  // Integer-cents division avoids float dust pushing an exact bracket boundary to the
  // wrong step (same guard as the backend's computeCashArrangementFee).
  const amountCents = Math.round(round2(cashAmount) * 100);
  const stepCents = Math.round(round2(step) * 100);
  const stepNumber = Math.ceil(amountCents / stepCents); // upper-inclusive brackets
  const incrementPerStep = round2((step * margin) / 100);
  return round2(stepNumber * incrementPerStep);
}
