export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  mockApi: import.meta.env.VITE_USE_MOCK_API !== "false",
  paymentPollingInterval: 2000,
  paymentMaxAttempts: 5,
};
