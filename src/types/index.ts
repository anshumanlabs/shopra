export interface ProductComment {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SellerDetails {
  id: string;
  name: string;
  businessName: string;
  gstin: string;
  rating: number;
  totalReviews: number;
  location: string;
  supportEmail: string;
  supportPhone: string;
  verified: boolean;
  dispatchTime: string;
}

export interface Product {
  id: number;
  name: string;
  companyName: string;
  sku: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
  rating: number;
  description: string;
  stock?: number;
  warranty: string;
  seller: SellerDetails;
  comments: ProductComment[];
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
