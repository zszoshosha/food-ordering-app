import { AdminOrderStatus } from "@/types/admin";

/**
 * Stable status labels for order management in the admin dashboard.
 */
export const ADMIN_ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  [AdminOrderStatus.PENDING]: "Pending",
  [AdminOrderStatus.PREPARING]: "Preparing",
  [AdminOrderStatus.OUT_FOR_DELIVERY]: "Out for Delivery",
  [AdminOrderStatus.DELIVERED]: "Delivered",
};

/**
 * Deterministic option list used by order status selects and filters.
 */
export const ADMIN_ORDER_STATUS_OPTIONS = [
  { value: AdminOrderStatus.PENDING, label: "Pending" },
  { value: AdminOrderStatus.PREPARING, label: "Preparing" },
  { value: AdminOrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
  { value: AdminOrderStatus.DELIVERED, label: "Delivered" },
] as const;
