export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  meta?: ResponseMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  total?: number;
  /** Notifications list echoes the user's current unread count here. */
  unreadCount?: number;
  /** Product search echoes the normalized query here. */
  query?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ResponseMeta;
  message?: string;
  success?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}
