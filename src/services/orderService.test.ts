import { beforeEach, describe, expect, it, vi } from "vitest";

import { orderService } from "./orderService";
import { apiClient } from "./apiClient";
import { env } from "../config/env";

vi.mock("./apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("orderService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("does not create an API order in local simulation mode", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(true);

    await expect(
      orderService.create({
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: {
          fullName: "Test User",
          email: "test@example.com",
          phone: "9999999999",
          address: "Test Street",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
      })
    ).rejects.toThrow("Local checkout must use the local order simulator");
  });

  it("creates an order using the new API request contract", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(false);

    const request = {
      items: [{ productId: 1, quantity: 2 }],
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "9999999999",
        address: "Test Street",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      items: [],
      shippingAddress: request.shippingAddress,
      subtotal: 500,
      discount: 0,
      shipping: 0,
      total: 500,
      orderStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      createdAt: "2026-01-01T00:00:00",
    });

    const result = await orderService.create(request);

    expect(apiClient.post).toHaveBeenCalledWith("/orders", request, undefined);
    expect(result.id).toBe("order-1");
    expect(result.paymentStatus).toBe("PENDING");
  });

  it("fetches an order by ID", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(false);

    vi.mocked(apiClient.get).mockResolvedValue({
      id: "order-1",
      paymentStatus: "PENDING",
    });

    const result = await orderService.getById("order-1");

    expect(apiClient.get).toHaveBeenCalledWith("/orders/order-1", undefined);
    expect(result?.id).toBe("order-1");
  });
});
