import { env } from "../config/env";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";

const STORAGE_KEY = "shopra_cart";

export const cartService = {
  async getCart(userId?: string) {
    if (env.isLocal) {
      return storageService.get(STORAGE_KEY, []);
    }

    return apiClient.get(`/cart${userId ? `?userId=${userId}` : ""}`);
  },

  async saveCart(cart: unknown, token?: string) {
    if (env.isLocal) {
      storageService.set(STORAGE_KEY, cart);
      return cart;
    }

    return apiClient.put("/cart", cart, token);
  },

  async clearCart(token?: string) {
    if (env.isLocal) {
      storageService.remove(STORAGE_KEY);
      return;
    }

    return apiClient.delete("/cart", token);
  },
};
