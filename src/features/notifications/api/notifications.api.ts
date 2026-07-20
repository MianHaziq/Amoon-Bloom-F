import { http } from "@/services/http";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ApiBroadcastInput,
  ApiBroadcastResult,
  ApiNotification,
  ApiNotificationList,
  NotificationListParams,
} from "../types";

export const notificationsApi = {
  /**
   * Enqueues a push/email broadcast to customers. Backend guard requires
   * ADMIN, or a MANAGER holding the NOTIFICATIONS permission. Returns the
   * enqueued job id (202). Throws ApiError(503) if the job engine is down.
   */
  async broadcast(payload: ApiBroadcastInput): Promise<ApiBroadcastResult> {
    const { data } = await http.post<ApiResponse<ApiBroadcastResult>>(
      "/admin/jobs/broadcast",
      payload
    );
    return data.data;
  },

  /**
   * The signed-in user's inbox (`GET /notifications`, newest first). The unread
   * count rides along in `meta.unreadCount`. Requires a customer JWT.
   */
  async list(params: NotificationListParams = {}): Promise<ApiNotificationList> {
    const { data } = await http.get<PaginatedResponse<ApiNotification>>(
      "/notifications",
      {
        params: {
          page: params.page,
          limit: params.limit,
          ...(params.unreadOnly ? { unreadOnly: true } : {}),
        },
      }
    );
    return {
      items: data.data,
      unreadCount: data.meta?.unreadCount ?? 0,
      page: data.meta?.pagination?.page ?? 1,
      totalPages: data.meta?.pagination?.totalPages ?? 1,
      total: data.meta?.pagination?.total ?? data.data.length,
    };
  },

  /** Just the unread count — cheap enough to poll for the header badge. */
  async unreadCount(): Promise<number> {
    const { data } = await http.get<ApiResponse<{ unreadCount: number }>>(
      "/notifications/unread-count"
    );
    return data.data.unreadCount;
  },

  /** Mark one notification read. */
  async markRead(id: string): Promise<void> {
    await http.patch(`/notifications/${id}/read`);
  },

  /** Mark every unread notification read. Returns the number updated. */
  async markAllRead(): Promise<number> {
    const { data } = await http.post<ApiResponse<{ updated: number }>>(
      "/notifications/read-all"
    );
    return data.data.updated;
  },
};
