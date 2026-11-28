import { env } from "../config/env";
import type { ShippingAddress, SavedAddress } from "../types/orders";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";

const getStorageKey = (email: string) => `shopra_addresses_${email}`;

export const addressService = {
  async getAll(email: string, token?: string): Promise<SavedAddress[]> {
    if (env.isLocal) {
      return storageService.get<SavedAddress[]>(getStorageKey(email), []);
    }

    return apiClient.get<SavedAddress[]>("/addresses", token);
  },

  async save(
    email: string,
    address: ShippingAddress,
    token?: string
  ): Promise<SavedAddress> {
    if (env.isLocal) {
      const addresses = storageService.get<SavedAddress[]>(getStorageKey(email), []);

      const newAddress: SavedAddress = {
        ...address,
        id: crypto.randomUUID(),
        isDefault: addresses.length === 0,
      };

      const updated = [...addresses, newAddress];

      storageService.set(getStorageKey(email), updated);
      return newAddress;
    }

    return apiClient.post<SavedAddress>("/addresses", address, token);
  },

  async update(
    email: string,
    id: string,
    address: Partial<ShippingAddress>,
    token?: string
  ): Promise<SavedAddress> {
    if (env.isLocal) {
      const addresses = storageService.get<SavedAddress[]>(getStorageKey(email), []);

      const updated = addresses.map((item) =>
        item.id === id ? { ...item, ...address } : item
      );

      storageService.set(getStorageKey(email), updated);

      const found = updated.find((item) => item.id === id);
      if (!found) {
        throw new Error("Address not found");
      }

      return found;
    }

    return apiClient.put<SavedAddress>(`/addresses/${id}`, address, token);
  },

  async delete(email: string, id: string, token?: string): Promise<void> {
    if (env.isLocal) {
      const addresses = storageService.get<SavedAddress[]>(getStorageKey(email), []);

      const updated = addresses.filter((item) => item.id !== id);

      if (updated.length > 0 && !updated.some((item) => item.isDefault)) {
        updated[0] = { ...updated[0], isDefault: true };
      }

      storageService.set(getStorageKey(email), updated);
      return;
    }

    return apiClient.delete(`/addresses/${id}`, token);
  },
};
