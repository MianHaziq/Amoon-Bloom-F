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

export interface ApiContactSubmitInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject?: ContactSubject;
  message: string;
}

export interface ApiContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
}
