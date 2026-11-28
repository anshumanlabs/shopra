import { env } from "../config/env";
import type { CreateOrderRequest, LocalOrderDraft, Order } from "../types/orders";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";

const STORAGE_KEY = "shopra_orders";

export const orderService = {
  async getAll(userId?: string, token?: string): Promise<Order[]> {
    if (env.isLocal) {
      const orders = storageService.get<Order[]>(STORAGE_KEY, []);

      return userId ? orders.filter((order) => order.userId === userId) : orders;
    }

    // The backend derives user identity from the authenticated gateway request.
    return apiClient.get<Order[]>("/orders", token);
  },

  async getById(id: string, token?: string): Promise<Order | null> {
    if (env.isLocal) {
      const orders = storageService.get<Order[]>(STORAGE_KEY, []);

      return orders.find((order) => order.id === id) ?? null;
    }

    return apiClient.get<Order>(`/orders/${encodeURIComponent(id)}`, token);
  },

  async create(request: CreateOrderRequest, token?: string): Promise<Order> {
    if (env.isLocal) {
      throw new Error("Use createLocalOrder() in local demo mode.");
    }

    return apiClient.post<Order>("/orders", request, token);
  },

  async createLocalOrder(draft: LocalOrderDraft): Promise<Order> {
    if (!env.isLocal) {
      throw new Error("Local order creation is available only in local demo mode.");
    }

    const orders = storageService.get<Order[]>(STORAGE_KEY, []);

    const order: Order = {
      id: crypto.randomUUID(),
      userId: draft.userId,
      items: draft.items,
      shippingAddress: draft.shippingAddress,
      subtotal: draft.subtotal,
      discount: draft.discount,
      shipping: draft.shipping,
      total: draft.total,
      orderStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };

    storageService.set(STORAGE_KEY, [...orders, order]);

    return order;
  },

  async markLocalPaymentSuccessful(orderId: string): Promise<Order> {
    if (!env.isLocal) {
      throw new Error("Local payment updates are unavailable in API mode.");
    }

    const orders = storageService.get<Order[]>(STORAGE_KEY, []);
    const index = orders.findIndex((order) => order.id === orderId);

    if (index === -1) {
      throw new Error("Order not found.");
    }

    const updated: Order = {
      ...orders[index],
      paymentStatus: "SUCCESS",
      orderStatus: "PROCESSING",
    };

    orders[index] = updated;
    storageService.set(STORAGE_KEY, orders);

    return updated;
  },
};
