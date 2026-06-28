/**
 * Admin broadcast types. The admin "send notification" action maps to the jobs
 * module — `POST /api/v1/admin/jobs/broadcast` — which enqueues a push/email
 * fan-out. There is no broadcast history endpoint, so this is a fire-and-send
 * action rather than a CRUD resource.
 *
 * `promotion` sends only to users who enabled promotional notifications;
 * `announcement` only to users who enabled announcements (per-user prefs in
 * `UserNotificationPreferences`).
 */

export type BroadcastKind = "announcement" | "promotion";

export interface ApiBroadcastInput {
  kind: BroadcastKind;
  title: string;
  body: string;
  title_ar?: string | null;
  body_ar?: string | null;
  /** Restrict delivery to a single region; omit for all regions. */
  regionId?: string | null;
  /** Optional deep-link / metadata payload attached to the push. */
  data?: Record<string, unknown> | null;
}

export interface ApiBroadcastResult {
  jobId: string;
}
