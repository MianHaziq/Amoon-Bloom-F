/**
 * Centralized query key factories. Each feature owns a namespace; mutations
 * invalidate by namespace prefix (e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.products.all })`).
 *
 * Convention:
 *   queryKeys.<feature>.all          — root key for the namespace
 *   queryKeys.<feature>.list(params) — list with optional filters
 *   queryKeys.<feature>.detail(id)   — single resource by id
 *
 * Always spread params into the key so different filter combinations cache
 * independently.
 */

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  products: {
    all: ["products"] as const,
    list: (params?: unknown) => [...queryKeys.products.all, "list", params ?? null] as const,
    byCategory: (categoryId: string, params?: unknown) =>
      [...queryKeys.products.all, "category", categoryId, params ?? null] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
  },

  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    detail: (id: string) => [...queryKeys.categories.all, "detail", id] as const,
  },

  cart: {
    all: ["cart"] as const,
    current: () => [...queryKeys.cart.all, "current"] as const,
    suggestions: (params?: unknown) =>
      [...queryKeys.cart.all, "suggestions", params ?? null] as const,
  },

  orders: {
    all: ["orders"] as const,
    myHistory: (params?: unknown) =>
      [...queryKeys.orders.all, "history", params ?? null] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
    status: (id: string) => [...queryKeys.orders.all, "status", id] as const,
    adminList: (params?: unknown) =>
      [...queryKeys.orders.all, "admin", "list", params ?? null] as const,
    adminHistory: (params?: unknown) =>
      [...queryKeys.orders.all, "admin", "history", params ?? null] as const,
  },

  addresses: {
    all: ["addresses"] as const,
    list: () => [...queryKeys.addresses.all, "list"] as const,
    detail: (id: string) => [...queryKeys.addresses.all, "detail", id] as const,
  },

  promoCodes: {
    all: ["promoCodes"] as const,
    available: (params?: unknown) =>
      [...queryKeys.promoCodes.all, "available", params ?? null] as const,
    list: (params?: unknown) =>
      [...queryKeys.promoCodes.all, "list", params ?? null] as const,
    detail: (id: string) => [...queryKeys.promoCodes.all, "detail", id] as const,
  },

  sections: {
    all: ["sections"] as const,
    list: () => [...queryKeys.sections.all, "list"] as const,
    detail: (id: string) => [...queryKeys.sections.all, "detail", id] as const,
  },

  banners: {
    all: ["banners"] as const,
    list: (params?: unknown) => [...queryKeys.banners.all, "list", params ?? null] as const,
  },

  contact: {
    all: ["contact"] as const,
    list: (params?: unknown) =>
      [...queryKeys.contact.all, "list", params ?? null] as const,
  },

  settings: {
    all: ["settings"] as const,
    public: () => [...queryKeys.settings.all, "public"] as const,
    admin: () => [...queryKeys.settings.all, "admin"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (params?: unknown) =>
      [...queryKeys.users.all, "list", params ?? null] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
    permissionsCatalog: () =>
      [...queryKeys.users.all, "permissions-catalog"] as const,
  },

  analytics: {
    all: ["analytics"] as const,
    presets: () => [...queryKeys.analytics.all, "presets"] as const,
    revenue: (params?: unknown) =>
      [...queryKeys.analytics.all, "revenue", params ?? null] as const,
    revenueByCategory: (params?: unknown) =>
      [...queryKeys.analytics.all, "revenue-by-category", params ?? null] as const,
    salesByDay: (params?: unknown) =>
      [...queryKeys.analytics.all, "sales-by-day", params ?? null] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    preferences: () => [...queryKeys.notifications.all, "preferences"] as const,
    list: (params?: unknown) =>
      [...queryKeys.notifications.all, "list", params ?? null] as const,
    unreadCount: () =>
      [...queryKeys.notifications.all, "unread-count"] as const,
  },

  regions: {
    all: ["regions"] as const,
    list: () => [...queryKeys.regions.all, "list"] as const,
  },

  vat: {
    all: ["vat"] as const,
    list: () => [...queryKeys.vat.all, "list"] as const,
    detail: (regionId: string) => [...queryKeys.vat.all, "detail", regionId] as const,
    public: () => [...queryKeys.vat.all, "public"] as const,
  },

  jobs: {
    all: ["jobs"] as const,
  },
} as const;
