export const ROUTES = {
  home: "/",
  shop: "/shop",
  category: (slug: string) => `/shop/category/${slug}`,
  product: (slug: string) => `/shop/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order/success",
  orderError: "/order/error",
  orderStatus: "/order/status",
  account: "/account",
  orders: "/account/orders",
  wishlist: "/account/wishlist",
  login: "/login",
  register: "/register",
  signup: "/signup",
  about: "/about",
  contact: "/contact",
  branches: "/branches",
  privacy: "/privacy",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
