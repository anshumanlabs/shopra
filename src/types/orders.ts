export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  isDefault: boolean;
}

export type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}


export interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  // items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Review {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}