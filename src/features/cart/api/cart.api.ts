import { http } from "@/services/http";
import type { ApiResponse } from "@/types";
import type {
  ApiCart,
  ApiCartAddInput,
  ApiCartItemMessageInput,
  ApiCartQuantityInput,
  ApiCartSuggestions,
  ApiCartSuggestionsParams,
} from "../api-types";

/**
 * `/cart` endpoints. All require an authenticated customer JWT.
 */
export const cartApi = {
  async get(): Promise<ApiCart> {
    const { data } = await http.get<ApiResponse<ApiCart>>("/cart");
    return data.data;
  },

  async add(payload: ApiCartAddInput): Promise<ApiCart> {
    const { data } = await http.post<ApiResponse<ApiCart>>("/cart", payload);
    return data.data;
  },

  async setQuantity(payload: ApiCartQuantityInput): Promise<ApiCart> {
    const { data } = await http.patch<ApiResponse<ApiCart>>("/cart/quantity", payload);
    return data.data;
  },

  async setItemMessage(payload: ApiCartItemMessageInput): Promise<ApiCart> {
    const { data } = await http.patch<ApiResponse<ApiCart>>(
      "/cart/item/message",
      payload
    );
    return data.data;
  },

  async setOrderMessage(orderMessage: string | null): Promise<ApiCart> {
    const { data } = await http.patch<ApiResponse<ApiCart>>("/cart/message", {
      orderMessage,
    });
    return data.data;
  },

  async removeItem(productId: string): Promise<ApiCart> {
    const { data } = await http.delete<ApiResponse<ApiCart>>(`/cart/item/${productId}`);
    return data.data;
  },

  async clear(): Promise<ApiCart> {
    const { data } = await http.delete<ApiResponse<ApiCart>>("/cart");
    return data.data;
  },

  async suggestions(
    params: ApiCartSuggestionsParams = {}
  ): Promise<ApiCartSuggestions> {
    const { data } = await http.get<ApiResponse<ApiCartSuggestions>>(
      "/cart/suggestions",
      { params }
    );
    return data.data;
  },
};
