import { db } from "@/lib/prisma";

type CreateOrderInput = {
  userId: string;
  address: string;
  total: number;
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

/**
 * Creates an order with its line items in a single transaction.
 */
export const createOrderByDb = async (payload: CreateOrderInput) => {
  return db.order.create({
    data: {
      userId: payload.userId,
      address: payload.address,
      total: payload.total,
      orderItems: {
        create: payload.orderItems,
      },
    },
  });
};

/**
 * Returns all orders for a user ordered by newest first.
 */
export const getUserOrdersByDb = async (userId: string) => {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
};
