"use server";

import { authOptions } from "@/server/auth";
import { db, withPrismaRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";

/**
 * Validates an authenticated delivery/admin session.
 */
const requireDeliverySession = async () => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user?.id || (role !== "DELIVERY" && role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  return session;
};

/**
 * Returns orders currently out for delivery.
 */
export const getDeliveryOrders = async () => {
  await requireDeliverySession();

  return withPrismaRetry(() =>
    db.order.findMany({
      where: {
        status: 2,
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
};

/**
 * Marks an order as delivered from the delivery queue.
 */
export const markOrderDelivered = async (orderId: string) => {
  await requireDeliverySession();

  if (!orderId) {
    return {
      ok: false as const,
      status: 400,
      error: "Order id is required.",
    };
  }

  const existing = await withPrismaRetry(() =>
    db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    }),
  );

  if (!existing) {
    return {
      ok: false as const,
      status: 404,
      error: "Order not found.",
    };
  }

  if (existing.status !== 2) {
    return {
      ok: false as const,
      status: 409,
      error: "Only out-for-delivery orders can be completed.",
    };
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status: 3 },
    select: { id: true, status: true, updatedAt: true },
  });

  return {
    ok: true as const,
    status: 200,
    item: {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
};
