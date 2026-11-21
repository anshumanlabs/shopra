
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Product,
  CartItem,
  ShopContextType,
} from "../types";

const ShopContext = createContext<ShopContextType | undefined>(
  undefined
);

interface ShopProviderProps {
  children: ReactNode;
}

// Convert old duplicate-product cart entries into quantity-based entries.
function normalizeCart(savedCart: unknown): CartItem[] {
  if (!Array.isArray(savedCart)) return [];

  const grouped = new Map<number, CartItem>();

  savedCart.forEach((item) => {
    if (!item || typeof item !== "object" || !("id" in item)) {
      return;
    }

    const product = item as Product & { quantity?: number };

    if (typeof product.id !== "number") return;

    const existing = grouped.get(product.id);
    const incomingQuantity =
      Number.isInteger(product.quantity) && product.quantity! > 0
        ? product.quantity!
        : 1;

    if (existing) {
      existing.quantity += incomingQuantity;
    } else {
      grouped.set(product.id, {
        ...product,
        quantity: incomingQuantity,
      });
    }
  });

  return Array.from(grouped.values());
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("shopora-cart");
      return saved ? normalizeCart(JSON.parse(saved)) : [];
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

  // Add product or increase its existing quantity.
  const addToCart = (product: Product, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  product.stock ?? Number.MAX_SAFE_INTEGER
                ),
              }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          quantity: Math.min(
            quantity,
            product.stock ?? Number.MAX_SAFE_INTEGER
          ),
        },
      ];
    });
  };

  // Update quantity directly from the cart.
  const updateQuantity = (id: number, quantity: number) => {
    if (!Number.isInteger(quantity)) return;

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                item.stock ?? Number.MAX_SAFE_INTEGER
              ),
            }
          : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
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
    updateQuantity,
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
