import { env } from "../config/env";
import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import products from "../data/products";

const STORAGE_KEY = "shopra_products";

export const productService = {
  async getAll(params?: {
    page?: number;
    size?: number;
    category?: string;
    sortBy?: string;
    order?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    if (env.isLocal) {
      return storageService.get(STORAGE_KEY, products);
    }

    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    if (params?.category) query.set("category", params.category);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.order) query.set("order", params.order);
    if (params?.minRating !== undefined) query.set("minRating", String(params.minRating));
    if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));

    const qs = query.toString();
    return apiClient.get(qs ? `/products?${qs}` : "/products");
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
