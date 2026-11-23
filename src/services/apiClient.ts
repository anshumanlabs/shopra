import { env } from "../config/env";

type RequestOptions = RequestInit & {
  token?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...requestOptions } = options;

  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(url: string, token?: string) => request<T>(url, { method: "GET", token }),

  post: <T>(url: string, body?: unknown, token?: string) =>
    request<T>(url, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      token,
    }),

  put: <T>(url: string, body?: unknown, token?: string) =>
    request<T>(url, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
      token,
    }),

  patch: <T>(url: string, body?: unknown, token?: string) =>
    request<T>(url, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
      token,
    }),

  delete: (url: string, token?: string) => request<void>(url, { method: "DELETE", token }),
};
