export interface ApiReview {
  id: string;
  productId: string;
  userId: string | null;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  isGuest: boolean;
  createdAt: string;
  /** Present only on the admin list (joined product title for the moderation table). */
  product?: { id: string; title: string };
}

export interface ApiReviewCreateInput {
  rating: number;
  comment: string;
  /** Required only when submitting as a guest (not signed in). */
  guestName?: string;
  guestEmail?: string;
}

export interface ApiReviewListParams {
  page?: number;
  limit?: number;
}

export interface ApiReviewAdminListParams extends ApiReviewListParams {
  search?: string;
  rating?: number;
  productId?: string;
}
