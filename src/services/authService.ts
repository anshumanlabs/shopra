import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export const authService = {
  register(request: RegisterRequest): Promise<AuthResponse> {
    return requestApi("/auth/register", request);
  },

  login(request: LoginRequest): Promise<AuthResponse> {
    return requestApi("/auth/login", request);
  },
};

function requestApi(
  endpoint: string,
  body: LoginRequest | RegisterRequest
): Promise<AuthResponse> {
  return request<AuthResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}