export type ContactSubject = "general" | "support" | "sales" | "other";

export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export interface ApiContactMessage {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  subject: ContactSubject | string;
  message: string;
  status: ContactStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface ApiContactStats {
  total: number;
  NEW: number;
  READ: number;
  REPLIED: number;
  ARCHIVED: number;
}
