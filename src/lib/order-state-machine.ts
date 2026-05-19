export enum OrderStatus {
  PENDING = 0,
  PAID = 1,
  PREPARING = 2,
  OUT_FOR_DELIVERY = 3,
  DELIVERED = 4,
}

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID],
  [OrderStatus.PAID]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
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
    case OrderStatus.PAID:
      return "Paid";
    case OrderStatus.PREPARING:
      return "Preparing";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery";
    case OrderStatus.DELIVERED:
      return "Delivered";
    default:
      return "Unknown";
  }
};
