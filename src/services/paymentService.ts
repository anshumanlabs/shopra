import { env } from "../config/env";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import type { Payment, PaymentRequest, PaymentResponse, PaymentStatus } from "../types/orders";

const STORAGE_KEY = "shopra_payments";

function getLocalPayments(): Payment[] {
  return storageService.get<Payment[]>(STORAGE_KEY, []);
}

function saveLocalPayments(payments: Payment[]): void {
  storageService.set(STORAGE_KEY, payments);
}

function simulateAsyncCompletion(paymentId: string): void {
  setTimeout(() => {
    const payments = getLocalPayments();
    const updated = payments.map((p) =>
      p.id === paymentId
        ? { ...p, status: "SUCCESS" as PaymentStatus, updatedAt: new Date().toISOString() }
        : p
    );
    saveLocalPayments(updated);
  }, 3000);
}

export const paymentService = {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (env.isLocal) {
      const payment: Payment = {
        id: crypto.randomUUID(),
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency ?? "INR",
        status: "PENDING",
        provider: request.provider ?? "MOCK_GATEWAY",
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };

      const payments = getLocalPayments();
      saveLocalPayments([...payments, payment]);

      simulateAsyncCompletion(payment.id);

      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        message: "Mock sandbox payment. Do not use real cards.",
      };
    }

    return apiClient.post<PaymentResponse>("/api/payments", request);
  },

  async getPayment(paymentId: string): Promise<PaymentResponse | null> {
    if (env.isLocal) {
      const payments = getLocalPayments();
      const payment = payments.find((p) => p.id === paymentId) ?? null;

      if (!payment) return null;

      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        message: "Mock sandbox payment. Do not use real cards.",
      };
    }

    return apiClient.get<PaymentResponse>(`/api/payments/${paymentId}`);
  },

  async getPaymentByOrder(orderId: string): Promise<PaymentResponse | null> {
    if (env.isLocal) {
      const payments = getLocalPayments();
      const payment = payments.find((p) => p.orderId === orderId) ?? null;

      if (!payment) return null;

      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        message: "Mock sandbox payment. Do not use real cards.",
      };
    }

    return apiClient.get<PaymentResponse>(`/api/payments?orderId=${encodeURIComponent(orderId)}`);
  },

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<PaymentResponse> {
    if (env.isLocal) {
      const payments = getLocalPayments();
      const index = payments.findIndex((p) => p.id === paymentId);

      if (index === -1) {
        throw new Error("Payment not found.");
      }

      payments[index] = {
        ...payments[index],
        status,
        updatedAt: new Date().toISOString(),
      };

      saveLocalPayments(payments);

      const payment = payments[index];

      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        message: "Mock sandbox payment. Do not use real cards.",
      };
    }

    return apiClient.patch<PaymentResponse>(`/api/payments/${paymentId}/status`, { status });
  },
};
