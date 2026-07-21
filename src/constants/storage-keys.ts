export const STORAGE_KEYS = {
  authToken: "amoonis.auth.token",
  cart: "amoonis.cart",
  wishlist: "amoonis.wishlist",
  location: "amoonis.location",
  theme: "amoonis.theme",
  // Holds the order returned by guest checkout so the success page can render it
  // without an authenticated refetch (guests can't call GET /orders/:id).
  guestOrder: "amoonis.guestOrder",
} as const;
