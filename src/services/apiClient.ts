import { env } from "../config/env";

type RequestOptions = RequestInit & {
  token?: string;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function readError(response: Response): Promise<ApiError> {
  const text = await response.text();

  if (!text) {
    return new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  try {
    const body: unknown = JSON.parse(text);

    if (body && typeof body === "object") {
      const data = body as {
        message?: string;
        error?: string;
        detail?: string;
      };

      return new ApiError(
        data.message || data.detail || data.error || response.statusText,
        response.status,
        body
      );
    }
  } catch {
    // The server returned plain text rather than JSON.
  }

  return new ApiError(text, response.status);
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers: suppliedHeaders, ...requestOptions } = options;

  const headers = new Headers(suppliedHeaders);

  if (requestOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    ...requestOptions,
    headers,
  });

  if (!response.ok) {
    throw await readError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
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
