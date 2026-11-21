import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product, ShopContextType } from "../types";

const ShopContext = createContext<ShopContextType | undefined>(
  undefined
);

interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("shopora-cart");
      return saved ? JSON.parse(saved) as Product[] : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("shopora-wishlist");
      return saved ? JSON.parse(saved) as Product[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("shopora-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("shopora-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setCart((previous) => [...previous, product]);
  };

  const removeFromCart = (id: number) => {
    setCart((previous) => {
      const index = previous.findIndex((item) => item.id === id);

      if (index === -1) return previous;

      return previous.filter((_, i) => i !== index);
    });
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((previous) =>
      previous.some((item) => item.id === product.id)
        ? previous.filter((item) => item.id !== product.id)
        : [...previous, product]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const value: ShopContextType = {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    toggleWishlist,
    clearCart,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}