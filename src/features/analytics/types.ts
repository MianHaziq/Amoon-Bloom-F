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
}

export interface ApiAnalyticsPreset {
  key: string;
  label: string;
  defaultBucket: string;
}

export interface ApiAnalyticsRevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface ApiAnalyticsRevenuePoint {
  bucket: string;
  revenue: number;
  orderCount: number;
}

export interface ApiAnalyticsRevenue {
  summary: ApiAnalyticsRevenueSummary;
  series: ApiAnalyticsRevenuePoint[];
  byStatus: Partial<Record<OrderStatus, number>>;
}

export interface ApiAnalyticsCategoryRevenue {
  categoryId: string;
  categoryTitle: string;
  revenue: number;
  orderCount: number;
}

export interface ApiAnalyticsDailySales {
  date: string;
  totalSales: number;
  orderCount: number;
}
