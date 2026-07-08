import type { ContactStatus } from "@/features/contact/types";
import type { MessageKey } from "@/i18n/messages";

export const CONTACT_STATUSES: ContactStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];

export const CONTACT_STATUS_TONE: Record<
  ContactStatus,
  "neutral" | "bloom" | "blush" | "success" | "ink"
> = {
  NEW: "bloom",
  READ: "neutral",
  REPLIED: "success",
  ARCHIVED: "ink",
};

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  ARCHIVED: "Archived",
};

/** i18n key per status so the admin UI renders in Arabic too. */
export const CONTACT_STATUS_LABEL_KEY: Record<ContactStatus, MessageKey> = {
  NEW: "admin.contactPage.statusNew",
  READ: "admin.contactPage.statusRead",
  REPLIED: "admin.contactPage.statusReplied",
  ARCHIVED: "admin.contactPage.statusArchived",
};
