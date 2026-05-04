export const ROUTES = {
  home: "/",
  shop: "/shop",
  category: (slug: string) => `/shop/category/${slug}`,
  product: (slug: string) => `/shop/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order/success",
  orderError: "/order/error",
  account: "/account",
  orders: "/account/orders",
  login: "/login",
  register: "/register",
  about: "/about",
  contact: "/contact",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
