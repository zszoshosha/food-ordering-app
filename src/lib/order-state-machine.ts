import { OrderStatus as PrismaOrderStatus } from "@prisma/client";

export enum OrderStatus {
  PENDING = 0,
  CONFIRMED = 1,
  PREPARING = 2,
  OUT_FOR_DELIVERY = 3,
  DELIVERED = 4,
  CANCELLED = 5,
}

const NUMERIC_TO_PRISMA: Partial<Record<OrderStatus, PrismaOrderStatus>> = {
  [OrderStatus.PENDING]: PrismaOrderStatus.PENDING,
  [OrderStatus.PREPARING]: PrismaOrderStatus.PREPARING,
  [OrderStatus.OUT_FOR_DELIVERY]: PrismaOrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.DELIVERED]: PrismaOrderStatus.DELIVERED,
  [OrderStatus.CANCELLED]: PrismaOrderStatus.CANCELLED,
};

const PRISMA_TO_NUMERIC: Partial<Record<PrismaOrderStatus, OrderStatus>> = {
  [PrismaOrderStatus.PENDING]: OrderStatus.PENDING,
  [PrismaOrderStatus.PREPARING]: OrderStatus.PREPARING,
  [PrismaOrderStatus.OUT_FOR_DELIVERY]: OrderStatus.OUT_FOR_DELIVERY,
  [PrismaOrderStatus.DELIVERED]: OrderStatus.DELIVERED,
  [PrismaOrderStatus.CANCELLED]: OrderStatus.CANCELLED,
};

export const toPrismaOrderStatus = (
  status: OrderStatus | number,
): PrismaOrderStatus =>
  NUMERIC_TO_PRISMA[status as OrderStatus] ?? PrismaOrderStatus.PENDING;

export const fromPrismaOrderStatus = (status: PrismaOrderStatus): OrderStatus =>
  PRISMA_TO_NUMERIC[status] ?? OrderStatus.PENDING;

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.OUT_FOR_DELIVERY]: [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const isValidOrderTransition = (
  currentStatus: number,
  nextStatus: number,
) => {
  const allowedTransitions =
    ORDER_TRANSITIONS[currentStatus as OrderStatus] ?? [];

  return allowedTransitions.includes(nextStatus as OrderStatus);
};

export const getOrderStatusLabel = (status: number) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.CONFIRMED:
      return "Confirmed";
    case OrderStatus.PREPARING:
      return "Preparing";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return "Unknown";
  }
};
