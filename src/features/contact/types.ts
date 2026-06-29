/**
 * Contact types — match the backend `UserContact` model + `getAllUserContacts`
 * response in Amoonis-Boutique-B. The admin list (`GET /contact/admin/issues`)
 * returns each contact with an embedded `user` (the submitter's profile).
 *
 * NOTE: the backend currently exposes ONLY list (admin) + submit (auth user).
 * There are no stats / detail / status-change / note / delete endpoints, so the
 * admin UI is read-only. See the gap report for the endpoints that would
 * restore full triage functionality.
 */

export type ContactSubject = "general" | "support" | "sales" | "other";

export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export interface ApiContactUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
}

export interface ApiContactMessage {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  user: ApiContactUser | null;
}

/**
 * Body for `POST /contact/issue`. The backend reads the submitter's
 * name/email/phone from their JWT profile, so only the subject + message are
 * sent. Requires the user to be authenticated and to have a phone on profile.
 */
export interface ApiContactSubmitInput {
  subject: string;
  message: string;
}

export interface ApiContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
}
