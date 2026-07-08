/**
 * Analytics types — match `/admin/analytics/*` endpoints. Admin or manager
 * with ORDERS or SETTINGS permission only.
 */

import type { OrderStatus } from "@/features/orders/types";

export type AnalyticsPreset =
  | "all_time"
  | "today"
  | "week"
  | "month"
  | "year"
  | string;

export interface AnalyticsRangeParams {
  preset?: AnalyticsPreset;
  from?: string;
  to?: string;
  /** Region code (e.g. "UAE", "SA") to scope analytics to a single region. Omit for a combined view across all regions. */
  region?: string;
}

export interface ApiAnalyticsPreset {
  key: string;
  label: string;
  bucket?: string;
}

export interface ApiAnalyticsRange {
  isAllTime: boolean;
  from: string | null;
  toExclusive: string | null;
}

export interface ApiAnalyticsRevenueSummary {
  activeOrderCount: number;
  revenue: number;
  averageOrderValue: number;
  cancelledOrderCount: number;
  cancelledRevenue: number;
  distinctCustomers: number;
}

export interface ApiAnalyticsRevenuePoint {
  bucket: string;
  orderCount: number;
  revenue: number;
  cancelledOrderCount: number;
  cancelledRevenue: number;
}

export interface ApiAnalyticsStatusBreakdownEntry {
  status: OrderStatus;
  orderCount: number;
  revenue: number;
}

export interface ApiAnalyticsRevenue {
  preset: string | null;
  presetLabel: string;
  currency: string;
  range: ApiAnalyticsRange;
  bucket: string;
  summary: ApiAnalyticsRevenueSummary;
  series: ApiAnalyticsRevenuePoint[];
  byStatus: ApiAnalyticsStatusBreakdownEntry[];
}

export interface ApiAnalyticsCategoryEntry {
  rank: number;
  categoryId: string | null;
  categoryTitle: string;
  orderCount: number;
  revenue: number;
  unitsSold: number;
  lineItemCount: number;
  revenueSharePercent: number;
}

export interface ApiAnalyticsCategoryRevenue {
  preset: string | null;
  presetLabel: string;
  currency: string;
  range: ApiAnalyticsRange;
  note: string;
  totalNetLineRevenue: number;
  categories: ApiAnalyticsCategoryEntry[];
}

export interface ApiAnalyticsDailyPoint {
  date?: string;
  month?: string;
  periodStart?: string;
  netOrderCount: number;
  netRevenue: number;
  cancelledOrderCount: number;
  cancelledRevenue: number;
}

export interface ApiAnalyticsDailySalesSummary {
  periodCount: number;
  netOrderCount: number;
  netRevenue: number;
  averageNetRevenuePerPeriod: number;
  cancelledOrderCount: number;
  cancelledRevenue: number;
  bestDay: ApiAnalyticsDailyPoint | null;
  bestMonth: ApiAnalyticsDailyPoint | null;
}

export interface ApiAnalyticsDailySales {
  preset: string | null;
  presetLabel: string;
  currency: string;
  range: ApiAnalyticsRange;
  granularity: "day" | "month";
  note: string;
  summary: ApiAnalyticsDailySalesSummary;
  points: ApiAnalyticsDailyPoint[];
}
