import { http } from "@/services/http";
import type { PaginatedResponse } from "@/types";
import type {
  ApiContactListParams,
  ApiContactMessage,
  ApiContactSubmitInput,
} from "../types";

export const contactApi = {
  /**
   * Storefront contact submission.
   *
   * NOTE: the backend's authenticated endpoint is `POST /contact/issue` (reads
   * the submitter's name/email/phone from their JWT profile and requires a
   * phone on file; body is just `{ subject, message }`). This public marketing
   * form predates that contract. Left unchanged pending a product decision on
   * whether contact should be public or login-gated — see the gap report.
   */
  async submit(payload: ApiContactSubmitInput): Promise<void> {
    await http.post("/contact", payload);
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
