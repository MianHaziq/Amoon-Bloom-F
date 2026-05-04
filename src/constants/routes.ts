export const ROUTES = {
  home: "/",
  shop: "/shop",
  product: (slug: string) => `/shop/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  account: "/account",
  orders: "/account/orders",
  login: "/login",
  register: "/register",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
