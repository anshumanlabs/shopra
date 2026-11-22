const dataSource = (
  import.meta.env.VITE_DATA_SOURCE || "local"
).toLowerCase();

if (!["local", "api"].includes(dataSource)) {
  throw new Error(
    `Invalid VITE_DATA_SOURCE: ${dataSource}. Use "local" or "api".`
  );
}

export const env = {
  dataSource: dataSource as "local" | "api",

  isLocal: dataSource === "local",
  isApi: dataSource === "api",

  useLocalStorage: dataSource === "local",
  useBackendApi: dataSource === "api",

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",

  authApiUrl:
    import.meta.env.VITE_AUTH_API_URL ||
    "http://localhost:8081/api/v1",

  paymentPollingInterval: 2000,
  paymentMaxAttempts: 5,
};