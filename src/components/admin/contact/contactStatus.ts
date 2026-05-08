import type { ContactStatus } from "@/features/contact/types";

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
