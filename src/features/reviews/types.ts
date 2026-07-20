export interface ApiReview {
  id: string;
  productId: string;
  userId: string | null;
  rating: number;
  comment: string;
  /** Customer-uploaded review photos (CDN URLs). Empty array when none. */
  media: string[];
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
  /** Uploaded review photo URLs (from reviewsApi.uploadMedia). Up to 6. */
  media?: string[];
  /** Required only when submitting as a guest (not signed in). */
  guestName?: string;
  guestEmail?: string;
}

export interface ApiReviewListParams {
  page?: number;
  limit?: number;
  /** Narrow to one star rating (1-5). Server-side filter used by the rating-breakdown bars. */
  rating?: number;
}

export interface ApiReviewAdminListParams extends ApiReviewListParams {
  search?: string;
  rating?: number;
  productId?: string;
}
