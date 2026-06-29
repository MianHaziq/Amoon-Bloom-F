import { http } from "@/services/http";
import type { PaginatedResponse } from "@/types";
import type {
  ApiContactListParams,
  ApiContactMessage,
  ApiContactSubmitInput,
} from "../types";

export const contactApi = {
  /**
   * Submit a contact / support issue. Authenticated: the backend reads the
   * submitter's name/email/phone from their JWT profile, so the body is just
   * `{ subject, message }`. Requires a phone on the user's profile (else 400).
   */
  async submit(payload: ApiContactSubmitInput): Promise<void> {
    await http.post("/contact/issue", payload);
  },

  // --- Admin / Manager (CONTACT) ---
  // Read-only: the backend exposes only list+filter for staff.
  async list(
    params: ApiContactListParams = {}
  ): Promise<PaginatedResponse<ApiContactMessage>> {
    const { data } = await http.get<PaginatedResponse<ApiContactMessage>>(
      "/contact/admin/issues",
      { params }
    );
    return data;
  },
};
