import { beforeEach, describe, expect, it, vi } from "vitest";

import { paymentService } from "./paymentService";
import { apiClient } from "./apiClient";
import { env } from "../config/env";

vi.mock("./apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("paymentService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("creates a pending local mock payment", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(true);

    const payment = await paymentService.createPayment({
      orderId: "order-1",
      paymentMethodToken: "tok_demo_1234",
      provider: "MOCK_GATEWAY",
    });

    expect(payment.orderId).toBe("order-1");
    expect(payment.status).toBe("PENDING");
    expect(payment.paymentId).toBeTruthy();
    expect(payment.message).toContain("Mock sandbox");
  });

  it("rejects a payment without an order ID", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(true);

    await expect(
      paymentService.createPayment({
        orderId: "",
        paymentMethodToken: "tok_demo",
      })
    ).rejects.toThrow("An order ID is required");
  });

  it("rejects a payment without a payment token", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(true);

    await expect(
      paymentService.createPayment({
        orderId: "order-1",
        paymentMethodToken: "",
      })
    ).rejects.toThrow("A payment method token is required");
  });

  it("uses the payment API in API mode", async () => {
    vi.spyOn(env, "isLocal", "get").mockReturnValue(false);

    vi.mocked(apiClient.post).mockResolvedValue({
      paymentId: "payment-1",
      orderId: "order-1",
      status: "PENDING",
      provider: "MOCK_GATEWAY",
      amount: 500,
      currency: "INR",
      createdAt: "2026-01-01T00:00:00",
      updatedAt: null,
      message: "Payment created",
    });

    const result = await paymentService.createPayment({
      orderId: "order-1",
      paymentMethodToken: "tok_demo",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments",
      expect.objectContaining({ orderId: "order-1" })
    );
    expect(result.paymentId).toBe("payment-1");
  });

  it("does not expose a browser payment-status update method", () => {
    expect("updatePaymentStatus" in paymentService).toBe(false);
  });
});
