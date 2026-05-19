import {
  Extraingredient,
  ProductCategory,
  ProductSize,
  UserRole,
} from "@prisma/client";

/**
 * Canonical admin order status values persisted in the database.
 */
export enum AdminOrderStatus {
  PENDING = 0,
  PREPARING = 1,
  OUT_FOR_DELIVERY = 2,
  DELIVERED = 3,
}

/**
 * Generic response payload for paginated resources.
 */
export type PaginatedResult<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Query parameters accepted by paginated admin list endpoints.
 */
export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

/**
 * Input payload for creating or updating a product from the admin dashboard.
 */
export type AdminProductInput = {
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: ProductCategory;
  order?: number;
  sizes: Array<{
    id?: string;
    name: ProductSize;
    price: number;
  }>;
  extras: Array<{
    id?: string;
    name: Extraingredient;
    price: number;
  }>;
};

/**
 * User table row shape sent to the admin client.
 */
export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ordersCount: number;
};

/**
 * Order table row shape sent to the admin client.
 */
export type AdminOrderListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  address: string;
  total: number;
  status: AdminOrderStatus;
  itemsCount: number;
  createdAt: string;
};

/**
 * Aggregated KPI snapshot used in the owner dashboard summary cards.
 */
export type AdminOverview = {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  activeDeliveryOrders: number;
  totalUsers: number;
  deliveryUsers: number;
  totalProducts: number;
};
