const dataSource = (import.meta.env.VITE_DATA_SOURCE || "local").toLowerCase();

if (!["local", "api"].includes(dataSource)) {
  throw new Error(`Invalid VITE_DATA_SOURCE: ${dataSource}. Use "local" or "api".`);
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  dataSource: dataSource as "local" | "api",

  isLocal: dataSource === "local",
  isApi: dataSource === "api",

  useLocalStorage: dataSource === "local",
  useBackendApi: dataSource === "api",

  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
  authApiUrl: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081/api/v1",

  paymentPollingInterval: positiveInteger(import.meta.env.VITE_PAYMENT_POLLING_INTERVAL, 2000),
  paymentMaxAttempts: positiveInteger(import.meta.env.VITE_PAYMENT_MAX_ATTEMPTS, 15),
};
