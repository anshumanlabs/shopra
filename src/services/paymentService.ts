import { env } from "../config/env";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import type { Payment, PaymentRequest, PaymentResponse } from "../types/orders";

const STORAGE_KEY = "shopra_payments";

const MOCK_MESSAGE = "Mock sandbox payment. Do not use real cards.";

function getLocalPayments(): Payment[] {
  return storageService.get<Payment[]>(STORAGE_KEY, []);
}

function saveLocalPayments(payments: Payment[]): void {
  storageService.set(STORAGE_KEY, payments);
}

function toResponse(payment: Payment): PaymentResponse {
  return {
    paymentId: payment.id,
    orderId: payment.orderId,
    status: payment.status,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    message: MOCK_MESSAGE,
  };
}

function simulateMockCompletion(paymentId: string): void {
  window.setTimeout(() => {
    const payments = getLocalPayments();

    const updated = payments.map((payment) =>
      payment.id === paymentId
        ? {
            ...payment,
            status: "SUCCESS" as const,
            updatedAt: new Date().toISOString(),
          }
        : payment
    );

    saveLocalPayments(updated);
  }, 3000);
}

export const paymentService = {
  async createPayment(
    request: PaymentRequest,
    token?: string,
    localAmount?: number
  ): Promise<PaymentResponse> {
    if (!request.orderId.trim()) {
      throw new Error("An order ID is required.");
    }

    if (!request.paymentMethodToken.trim()) {
      throw new Error("A payment method token is required.");
    }

    if (env.isLocal) {
      if (typeof localAmount !== "number" || localAmount <= 0) {
        throw new Error("A valid local demo payment amount is required.");
      }

      const payment: Payment = {
        id: crypto.randomUUID(),
        orderId: request.orderId,
        amount: localAmount,
        currency: "INR",
        status: "PENDING",
        provider: request.provider ?? "MOCK_GATEWAY",
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };

      saveLocalPayments([...getLocalPayments(), payment]);

      simulateMockCompletion(payment.id);

      return toResponse(payment);
    }

    // API mode: amount and currency are calculated by the backend.
    return apiClient.post<PaymentResponse>("/payments", request, token);
  },

  async getPayment(paymentId: string, token?: string): Promise<PaymentResponse | null> {
    if (env.isLocal) {
      const payment = getLocalPayments().find((item) => item.id === paymentId) ?? null;

      return payment ? toResponse(payment) : null;
    }

    return apiClient.get<PaymentResponse>(`/payments/${encodeURIComponent(paymentId)}`, token);
  },

  async getPaymentByOrder(orderId: string, token?: string): Promise<PaymentResponse | null> {
    if (env.isLocal) {
      const payment = getLocalPayments().find((item) => item.orderId === orderId) ?? null;

      return payment ? toResponse(payment) : null;
    }

    return apiClient.get<PaymentResponse>(
      `/payments?orderId=${encodeURIComponent(orderId)}`,
      token
    );
  },
};
