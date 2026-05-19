"use server";

import { authOptions } from "@/server/auth";
import { db, withPrismaRetry } from "@/lib/prisma";
import {
  OrderStatus,
} from "@/lib/order-state-machine";
import {
  ActionResponse,
  actionError,
  actionSuccess,
} from "@/types/action-response";
import { deliveryOrderIdSchema } from "@/validation/delivery";
import { getServerSession } from "next-auth";

/**
 * Validates an authenticated delivery/admin session.
 */
const requireDeliverySession = async (): Promise<
  ActionResponse<{ userId: string }>
> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  const role = user?.role;

  if (!user?.id || (role !== "DELIVERY" && role !== "ADMIN")) {
    return actionError("Unauthorized");
  }

  return actionSuccess({ userId: user.id });
};

/**
 * Returns orders currently out for delivery.
 */
export const getDeliveryOrders = async (): Promise<
  ActionResponse<
    Array<{
      id: string;
      address: string;
      total: number;
      createdAt: Date;
      user: {
        name: string;
        email: string;
      };
      orderItems: Array<{
        quantity: number;
      }>;
    }>
  >
> => {
  const auth = await requireDeliverySession();
  if (!auth.success) {
    return auth;
  }

  try {
    const orders = await withPrismaRetry(() =>
      db.order.findMany({
        where: {
          status: OrderStatus.OUT_FOR_DELIVERY,
        },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
        },
      }),
    );

    return actionSuccess(orders);
  } catch {
    return actionError("Failed to fetch delivery orders.");
  }
};

/**
 * Marks an order as delivered from the delivery queue.
 */
export const markOrderDelivered = async (
  orderId: string,
): Promise<
  ActionResponse<{
    id: string;
    status: number;
    updatedAt: string;
  }>
> => {
  const auth = await requireDeliverySession();
  if (!auth.success) {
    return auth;
  }

  const parsed = deliveryOrderIdSchema.safeParse({ orderId });
  if (!parsed.success) {
    return actionError("Invalid order id.", parsed.error.flatten().fieldErrors);
  }

  const existing = await withPrismaRetry(() =>
    db.order.findUnique({
      where: { id: parsed.data.orderId },
      select: { id: true, status: true },
    }),
  );

  if (!existing) {
    return actionError("Order not found.");
  }

  if (existing.status !== OrderStatus.OUT_FOR_DELIVERY) {
    return actionError("Only out-for-delivery orders can be completed.");
  }

  const updated = await withPrismaRetry(() =>
    db.order.update({
      where: { id: parsed.data.orderId },
      data: { status: OrderStatus.DELIVERED },
      select: { id: true, status: true, updatedAt: true },
    }),
  );

  return actionSuccess({
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt.toISOString(),
  });
};
