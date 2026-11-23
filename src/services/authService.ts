import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "../types/auth";

import { env } from "../config/env";

const API_BASE_URL = env.authApiUrl;

const USERS_KEY = "shopora_local_users";

interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  passwordHash: string;
  passwordSalt: string;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)),
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return btoa(
    Array.from(new Uint8Array(hash))
      .map((byte) => String.fromCharCode(byte))
      .join("")
  );
}

function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(
    Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join("")
  );
}

function getLocalUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as LocalUser[];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function createAuthResponse(user: LocalUser): AuthResponse {
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: `local-${crypto.randomUUID()}`,
    refreshToken: null,
    tokenType: "Bearer",
    expiresIn: 86400,
    user: authUser,
  };
}

async function apiRequest(
  endpoint: string,
  body: LoginRequest | RegisterRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      error?: string;
    } | null;

    throw new Error(
      errorData?.message || errorData?.error || `Request failed with status ${response.status}`
    );
  }

  return data as AuthResponse;
}

export const authService = {
  async register(request: RegisterRequest): Promise<AuthResponse> {
    if (!env.useLocalStorage) {
      return apiRequest("/auth/register", request);
    }

    const users = getLocalUsers();
    const email = request.email.trim().toLowerCase();

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(request.password, salt);

    const newUser: LocalUser = {
      id: crypto.randomUUID(),
      name: request.name.trim(),
      email,
      role: "CUSTOMER",
      passwordHash,
      passwordSalt: salt,
    };

    users.push(newUser);
    saveLocalUsers(users);

    return createAuthResponse(newUser);
  },

  async login(request: LoginRequest): Promise<AuthResponse> {
    if (!env.useLocalStorage) {
      return apiRequest("/auth/login", request);
    }

    const email = request.email.trim().toLowerCase();
    const users = getLocalUsers();

    const user = users.find((item) => item.email === email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordHash = await hashPassword(request.password, user.passwordSalt);

    if (passwordHash !== user.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    return createAuthResponse(user);
  },
};
