import { env } from "../config/env";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import products from "../data/products";

const STORAGE_KEY = "shopra_products";

export const productService = {
  async getAll() {
    if (env.isLocal) {
      return storageService.get(STORAGE_KEY, products);
    }

    return apiClient.get("/products");
  },

  async getById(id: number) {
    if (env.isLocal) {
      const allProducts = storageService.get(STORAGE_KEY, products);
      return allProducts.find((product) => product.id === id) ?? null;
    }

    return apiClient.get(`/products/${id}`);
  },

  async save(product: unknown) {
    if (env.isLocal) {
      const allProducts = storageService.get(STORAGE_KEY, products);
      storageService.set(STORAGE_KEY, [...allProducts, product]);
      return product;
    }

    return apiClient.post("/products", product);
  },
};
