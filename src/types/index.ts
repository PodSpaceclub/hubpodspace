export type Role = "ADMIN" | "PARTNER";
export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface Partner {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  whatsapp: string;
  phone?: string;
  category?: string;
  status: PartnerStatus;
  createdAt: Date;
  user?: User;
  products?: Product[];
  orders?: Order[];
}

export interface Product {
  id: string;
  partnerId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
  createdAt: Date;
  partner?: Partner;
}

export interface Order {
  id: string;
  partnerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  commission: number;
  partnerAmount: number;
  status: OrderStatus;
  stripeId?: string;
  sourceCode?: string;
  notes?: string;
  createdAt: Date;
  partner?: Partner;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface TrackingCode {
  id: string;
  code: string;
  label: string;
  description?: string;
  orders: number;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  totalRevenue: number;
  ordersThisMonth: number;
  productsCount: number;
  pendingOrders: number;
}

export interface AdminStats {
  totalPartners: number;
  totalSales: number;
  commissionEarned: number;
  pendingApprovals: number;
}
