import { env } from "../config/env";
import type { Order } from "../types/orders";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";

const STORAGE_KEY = "shopra_orders";

export const orderService = {
  async getAll(userId?: string, token?: string): Promise<Order[]> {
    if (env.isLocal) {
      const orders = storageService.get<Order[]>(STORAGE_KEY, []);

      return userId ? orders.filter((order) => order.userId === userId) : orders;
    }

    return apiClient.get<Order[]>(
      `/orders${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`,
      token
    );
  },

  async getById(id: string, token?: string): Promise<Order | null> {
    if (env.isLocal) {
      const orders = storageService.get<Order[]>(STORAGE_KEY, []);

      return orders.find((order) => order.id === id) ?? null;
    }

    return apiClient.get<Order>(`/orders/${id}`, token);
  },

  async create(order: Omit<Order, "id" | "createdAt">, token?: string): Promise<Order> {
    if (env.isLocal) {
      const orders = storageService.get<Order[]>(STORAGE_KEY, []);

      const newOrder: Order = {
        ...order,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      storageService.set(STORAGE_KEY, [...orders, newOrder]);

      return newOrder;
    }

    return apiClient.post<Order>("/orders", order, token);
  },
};
