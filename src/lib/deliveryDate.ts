/**
 * Tz-neutral "YYYY-MM-DD" date-key helpers for the storefront's delivery-date math —
 * mirrors the backend's src/utils/businessTime.js so the checkout preview computes the
 * same standard-delivery arrival the server will snapshot.
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Weekday (0=Sun..6=Sat) of a "YYYY-MM-DD" key. */
export function weekdayOfKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "YYYY-MM-DD" key `n` days after `key`. */
export function addDaysToKey(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

/** Whole-day difference `toKey - fromKey`. */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const [ay, am, ad] = fromKey.split("-").map(Number);
  const [by, bm, bd] = toKey.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** A day is deliverable if its weekday is allowed (empty list = all) and not blacked out. */
export function isDeliverableDay(
  key: string,
  allowedWeekdays: number[],
  blackoutKeys: Set<string>
): boolean {
  if (blackoutKeys.has(key)) return false;
  if (allowedWeekdays.length > 0) return allowedWeekdays.includes(weekdayOfKey(key));
  return true;
}

/** Parse "HH:mm" -> minutes since midnight, or null if malformed. */
export function parseHHmm(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minutes since local midnight of "now" in `timeZone` (for cutoff comparisons). */
export function nowMinutesInTz(timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

/** First deliverable day at/after `fromKey` (capped at a year so an impossible config
 *  can't loop forever). Returns null if none found. */
export function nextDeliverableKey(
  fromKey: string,
  allowedWeekdays: number[],
  blackoutKeys: Set<string>
): string | null {
  let key = fromKey;
  for (let i = 0; i < 366; i += 1) {
    if (isDeliverableDay(key, allowedWeekdays, blackoutKeys)) return key;
    key = addDaysToKey(key, 1);
  }
  return null;
}
