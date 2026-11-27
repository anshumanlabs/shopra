import { env } from "../config/env";
import { apiClient } from "./apiClient";
import type { AuthUser } from "../types/auth";

const STORAGE_KEY = "shopora_user";

export const userService = {
  async getProfile(token?: string): Promise<AuthUser | null> {
    if (env.isLocal) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? (JSON.parse(saved) as AuthUser) : null;
      } catch {
        return null;
      }
    }

    return apiClient.get<AuthUser>("/api/v1/auth/profile", token);
  },

  async updateProfile(userData: Partial<AuthUser>, token?: string): Promise<AuthUser> {
    if (env.isLocal) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? (JSON.parse(saved) as AuthUser) : null;

      if (!current) {
        throw new Error("No user profile found.");
      }

      const updated = { ...current, ...userData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    }

    return apiClient.put<AuthUser>("/api/v1/auth/profile", userData, token);
  },
};
