import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type { ApiBroadcastInput, ApiBroadcastResult } from "../types";

export const notificationsApi = {
  /**
   * Enqueues a push/email broadcast to customers. Backend guard requires
   * ADMIN, or a MANAGER holding the SETTINGS or ORDERS permission. Returns the
   * enqueued job id (202). Throws ApiError(503) if the job engine is down.
   */
  async broadcast(payload: ApiBroadcastInput): Promise<ApiBroadcastResult> {
    const { data } = await http.post<ApiResponse<ApiBroadcastResult>>(
      "/admin/jobs/broadcast",
      payload
    );
    return data.data;
  },
};
