export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  isDefault: boolean;
}

export type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface OrderItem {
  productId: number | string;
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

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
}

export interface LocalOrderDraft {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaymentRequest {
  orderId: string;
  paymentMethodToken: string;
  provider?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  provider: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
  message: string;
}
