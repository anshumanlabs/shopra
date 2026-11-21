export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
  rating: number;
  description: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  toggleWishlist: (product: Product) => void;
  clearCart: () => void;
}
