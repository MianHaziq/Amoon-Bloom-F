"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { CloseIcon } from "@/components/icons";
import { useT } from "@/i18n/useT";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/ui.slice";
import { Button } from "@/components/ui";
import { queryKeys } from "@/services/queryKeys";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { settingsApi } from "@/features/settings/api/settings.api";
import { StarRatingInput } from "@/features/reviews/components/StarRatingInput";
import { StarRatingDisplay } from "@/features/reviews/components/StarRatingDisplay";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import type { PaginatedResponse } from "@/types";
import type { ApiReview } from "@/features/reviews/types";
import type { ProductDescriptionBlock, ProductOptionGroup } from "../types";

interface ProductTabsProps {
  productId: string;
  description?: string;
  descriptions?: ProductDescriptionBlock[];
  options?: ProductOptionGroup[];
  category?: string;
}

const REVIEWS_PAGE_SIZE = 5;

/**
 * Product detail tabs — mirrors the client's PDP: Description · Additional
 * information · Reviews. Description renders the full copy (line breaks kept so
 * "Includes:" bullet lists show); Additional information is a spec table of the
 * product's option groups + category; Reviews is a real, working list + a
 * "write a review" form (signed-in customers always can; guests can too unless
 * an admin has turned off Settings.allowGuestReviews).
 */
export function ProductTabs({
  productId,
  description,
  descriptions,
  options,
  category,
}: ProductTabsProps) {
  const { t } = useT();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const blocks = (descriptions ?? []).filter((d) => d.description?.trim());
  const hasDescription = Boolean(description?.trim()) || blocks.length > 0;
  const specs: { label: string; value: string }[] = [
    ...(category ? [{ label: t("shop.category"), value: category }] : []),
    ...(options ?? [])
      .filter((o) => o.options?.length)
      .map((o) => ({ label: o.title, value: o.options.join(", ") })),
  ];

  // Star clicked in the rating-breakdown bars narrows the list server-side;
  // the summary stats (avgRating/reviewCount/ratingBreakdown) always stay
  // whole-product so the bars never shift under the customer's cursor.
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const reviewsQuery = useInfiniteQuery({
    queryKey: queryKeys.reviews.list(productId, {
      limit: REVIEWS_PAGE_SIZE,
      rating: ratingFilter ?? undefined,
    }),
    queryFn: ({ pageParam }): Promise<PaginatedResponse<ApiReview>> =>
      reviewsApi.listForProduct(productId, {
        page: pageParam,
        limit: REVIEWS_PAGE_SIZE,
        rating: ratingFilter ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.meta?.pagination;
      return p && p.page < p.totalPages ? p.page + 1 : undefined;
    },
  });

  const reviews = useMemo(
    () => (reviewsQuery.data?.pages ?? []).flatMap((pg) => pg.data),
    [reviewsQuery.data]
  );
  const firstPageMeta = reviewsQuery.data?.pages[0]?.meta;
  const reviewCount = firstPageMeta?.reviewCount ?? 0;
  const avgRating = firstPageMeta?.avgRating ?? null;
  const ratingBreakdown = firstPageMeta?.ratingBreakdown ?? [];

  const publicSettingsQuery = useQuery({
    queryKey: queryKeys.settings.public(),
    queryFn: () => settingsApi.getPublic(),
    staleTime: 60_000,
  });
  // Default to allowed while loading — avoids flashing a "sign in" prompt then
  // yanking it away once the (usually-true) setting resolves a moment later.
  const guestReviewsAllowed = publicSettingsQuery.data?.allowGuestReviews ?? true;

  const tabs = [
    hasDescription && { id: "description", label: t("product.tabDescription") },
    specs.length > 0 && { id: "info", label: t("product.tabInfo") },
    { id: "reviews", label: `${t("product.tabReviews")} (${reviewCount})` },
  ].filter(Boolean) as { id: string; label: string }[];

  const [active, setActive] = useState(tabs[0]?.id ?? "reviews");
  if (tabs.length === 0) return null;

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink-100"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative -mb-px pb-3 text-sm font-semibold tracking-tight transition-colors sm:text-base",
                isActive
                  ? "text-ink-900"
                  : "text-ink-400 hover:text-ink-700"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-bloom-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="pt-6">
        {active === "description" && (
          <div className="max-w-3xl space-y-5">
            {blocks.length > 0
              ? blocks.map((d) => (
                  <div key={d.id}>
                    {d.title && (
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-bloom-700">
                        {d.title}
                      </p>
                    )}
                    <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">
                      {d.description}
                    </p>
                  </div>
                ))
              : description?.trim() && (
                  <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">
                    {description}
                  </p>
                )}
          </div>
        )}

        {active === "info" && (
          <div className="max-w-2xl overflow-hidden rounded-2xl border border-ink-100">
            <table className="w-full text-sm">
              <tbody>
                {specs.map((s, i) => (
                  <tr
                    key={s.label}
                    className={cn(i % 2 === 1 && "bg-cream-50")}
                  >
                    <th
                      scope="row"
                      className="w-1/3 px-4 py-3 text-start align-top font-medium text-ink-900"
                    >
                      {s.label}
                    </th>
                    <td className="px-4 py-3 text-ink-600">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === "reviews" && (
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="font-display text-xl text-ink-900">
                {t("product.reviewsHeading")}
              </h3>

              {reviewCount > 0 && (
                <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
                  <div className="flex shrink-0 flex-col items-start gap-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-4xl font-medium text-ink-900">
                        {avgRating != null ? avgRating.toFixed(1) : "—"}
                      </span>
                      <span className="text-sm text-ink-500">{t("product.outOf5")}</span>
                    </div>
                    <StarRatingDisplay rating={avgRating ?? 0} size={18} />
                    <span className="text-sm text-ink-500">
                      {reviewCount} {reviewCount === 1 ? t("product.reviewOne") : t("product.reviewOther")}
                    </span>
                  </div>

                  {ratingBreakdown.length > 0 && (
                    <div className="flex flex-col gap-1.5 sm:max-w-sm">
                      {ratingBreakdown.map((b) => {
                        const pct = reviewCount > 0 ? Math.round((b.count / reviewCount) * 100) : 0;
                        const isActive = ratingFilter === b.rating;
                        return (
                          <button
                            key={b.rating}
                            type="button"
                            disabled={b.count === 0}
                            onClick={() => setRatingFilter(isActive ? null : b.rating)}
                            className="group flex items-center gap-3 rounded-md py-0.5 text-start disabled:pointer-events-none"
                          >
                            <span
                              className={cn(
                                "w-14 shrink-0 text-xs font-medium",
                                isActive ? "text-bloom-700" : "text-ink-600"
                              )}
                            >
                              {t("product.ratingStarFilter", { n: b.rating })}
                            </span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                              <span
                                className={cn(
                                  "block h-full rounded-full transition-colors",
                                  isActive
                                    ? "bg-bloom-600"
                                    : "bg-(--color-gold-500) group-hover:bg-bloom-500"
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="w-7 shrink-0 text-end text-xs tabular-nums text-ink-500">
                              {b.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5">
                {!showReviewForm && (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                    {t("product.writeReviewCta")}
                  </Button>
                )}
              </div>
            </div>

            {showReviewForm && (
              <ReviewForm
                productId={productId}
                isAuthenticated={isAuthenticated}
                userName={user?.fullName ?? null}
                guestReviewsAllowed={guestReviewsAllowed}
                onCancel={() => setShowReviewForm(false)}
                onSubmitted={() => {
                  dispatch(
                    pushToast({ title: t("product.reviewSubmitted"), variant: "success" })
                  );
                  queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
                  setShowReviewForm(false);
                }}
              />
            )}

            {ratingFilter != null && (
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <span>{t("product.showingRatingFilter", { n: ratingFilter })}</span>
                <button
                  type="button"
                  onClick={() => setRatingFilter(null)}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-ink-400"
                >
                  <CloseIcon size={12} />
                  {t("product.showAllReviews")}
                </button>
              </div>
            )}

            {reviewsQuery.isPending ? (
              <p className="text-sm text-ink-400">…</p>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50 px-6 py-10 text-center">
                <p className="font-display text-lg text-ink-900">
                  {ratingFilter != null
                    ? t("product.noReviewsForRating", { n: ratingFilter })
                    : t("product.noReviews")}
                </p>
                {ratingFilter == null && (
                  <p className="mt-1 text-sm text-ink-500">{t("product.noReviewsBody")}</p>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-6">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-ink-100 pb-6 last:border-0">
                    <div className="flex items-center gap-3">
                      <ReviewerAvatar name={r.reviewerName} url={r.reviewerAvatar} />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{r.reviewerName}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <StarRatingDisplay rating={r.rating} size={13} />
                          <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                      {r.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {reviewsQuery.hasNextPage && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => reviewsQuery.fetchNextPage()}
                  isLoading={reviewsQuery.isFetchingNextPage}
                >
                  {t("product.loadMoreReviews")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewerAvatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-sm font-semibold text-bloom-700">
      {initial}
    </span>
  );
}

function ReviewForm({
  productId,
  isAuthenticated,
  userName,
  guestReviewsAllowed,
  onSubmitted,
  onCancel,
}: {
  productId: string;
  isAuthenticated: boolean;
  userName: string | null;
  guestReviewsAllowed: boolean;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const { t } = useT();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; comment?: string; name?: string; email?: string }>({});

  const submitMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create(productId, {
        rating,
        comment: comment.trim(),
        ...(isAuthenticated
          ? {}
          : { guestName: guestName.trim(), guestEmail: guestEmail.trim() }),
      }),
    onSuccess: () => {
      setRating(0);
      setComment("");
      setGuestName("");
      setGuestEmail("");
      setErrors({});
      onSubmitted();
    },
  });

  if (!isAuthenticated && !guestReviewsAllowed) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-cream-50 px-5 py-4 text-sm text-ink-700">
        {t("product.reviewSignInPrompt")}{" "}
        <Link href={ROUTES.login} className="font-semibold text-bloom-700 hover:underline">
          {t("common.signIn")}
        </Link>
      </div>
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (rating < 1 || rating > 5) next.rating = t("product.ratingRequired");
    if (!comment.trim()) next.comment = t("product.reviewTextRequired");
    if (!isAuthenticated) {
      if (!guestName.trim()) next.name = t("product.reviewNameRequired");
      if (!emailPattern.test(guestEmail.trim())) next.email = t("product.reviewEmailRequired");
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    submitMutation.mutate();
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5"
    >
      <p className="font-display text-lg text-ink-900">{t("product.writeReview")}</p>

      <StarRatingInput
        value={rating}
        onChange={(v) => {
          setRating(v);
          if (errors.rating) setErrors((e) => ({ ...e, rating: undefined }));
        }}
        label={t("product.yourRating")}
        error={errors.rating}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-900">
          {t("product.yourReview")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) setErrors((e2) => ({ ...e2, comment: undefined }));
          }}
          placeholder={t("product.reviewPlaceholder")}
          rows={4}
          className={cn(
            "w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4",
            errors.comment
              ? "border-danger focus:ring-danger/10"
              : "border-ink-200 focus:border-bloom-400 focus:ring-bloom-100"
          )}
        />
        {errors.comment && <p className="mt-1 text-xs text-danger">{errors.comment}</p>}
      </div>

      {!isAuthenticated && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (errors.name) setErrors((e2) => ({ ...e2, name: undefined }));
              }}
              placeholder={t("product.reviewNamePlaceholder")}
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4",
                errors.name
                  ? "border-danger focus:ring-danger/10"
                  : "border-ink-200 focus:border-bloom-400 focus:ring-bloom-100"
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => {
                setGuestEmail(e.target.value);
                if (errors.email) setErrors((e2) => ({ ...e2, email: undefined }));
              }}
              placeholder={t("product.reviewEmailPlaceholder")}
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4",
                errors.email
                  ? "border-danger focus:ring-danger/10"
                  : "border-ink-200 focus:border-bloom-400 focus:ring-bloom-100"
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            <p className="mt-1 text-xs text-ink-400">{t("product.reviewEmailHint")}</p>
          </div>
        </div>
      )}

      {isAuthenticated && userName && (
        <p className="text-xs text-ink-400">
          {t("product.postingAsName", { name: userName })}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={submitMutation.isPending}>
          {t("product.submitReview")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("product.cancelReview")}
        </Button>
      </div>
    </form>
  );
}
