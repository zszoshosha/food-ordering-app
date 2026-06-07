"use server";

import { db, withPrismaRetry } from "../../lib/prisma";
import { createOrderByDb, getUserOrdersByDb } from "../db/order";
import {
  ActionResponse,
  actionError,
  actionSuccess,
} from "../../types/action-response";
import {
  checkoutSchema,
  type CheckoutInput,
  type CheckoutItemInput,
} from "../../validation/checkout";
import { z } from "zod";

const userIdSchema = z.string().cuid();

const buildAddress = (payload: CheckoutInput) => {
  const parts = [
    payload.address,
    payload.city,
    payload.zipCode,
    payload.phone,
    payload.email,
  ].filter(Boolean);

  return parts.join(", ");
};

const calculateLineUnitPrice = (
  item: CheckoutItemInput,
  product: {
    basePrice: number;
    sizes: Array<{ id: string; price: number }>;
    extras: Array<{ id: string; price: number }>;
  },
) => {
  const sizePrice = item.sizeId
    ? (product.sizes.find((size) => size.id === item.sizeId)?.price ?? null)
    : 0;

  if (item.sizeId && sizePrice === null) {
    throw new Error("Invalid size selection for one of the items.");
  }

  const extrasPrice = (item.extraIds ?? []).reduce((sum, extraId) => {
    const extra = product.extras.find((entry) => entry.id === extraId);
    if (!extra) {
      throw new Error("Invalid extras selection for one of the items.");
    }
    return sum + Number(extra.price);
  }, 0);

  return Number(product.basePrice) + Number(sizePrice) + extrasPrice;
};

export const createOrder = async (
  userId: string,
  payload: unknown,
): Promise<
  ActionResponse<{
    id: string;
    total: number;
    createdAt: Date;
  }>
> => {
  const parsedUserId = userIdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    return actionError("Invalid user id.");
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError(
      "Invalid checkout payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const productIds = [...new Set(data.items.map((item) => item.productId))];

  const products = await withPrismaRetry(() =>
    db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        sizes: true,
        extras: true,
      },
    }),
  );

  if (products.length !== productIds.length) {
    return actionError("One or more cart items are no longer available.");
  }

  try {
    const pricedItems = data.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        throw new Error("One or more cart items are no longer available.");
      }

      const unitPrice = calculateLineUnitPrice(item, product);

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(unitPrice.toFixed(2)),
      };
    });

    const subtotal = pricedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.1;
    const total = Number((subtotal + tax).toFixed(2));

    if (Math.abs(total - data.total) > 0.01) {
      return actionError(
        "Cart total changed. Please review your cart and try again.",
      );
    }

    const createdOrder = await createOrderByDb({
      userId: parsedUserId.data,
      address: buildAddress(data),
      total,
      orderItems: pricedItems,
    });

    return actionSuccess({
      id: createdOrder.id,
      total: createdOrder.total,
      createdAt: createdOrder.createdAt,
    });
  } catch (error) {
    console.error("Create order failed:", error);
    return actionError("Failed to create order. Please try again.");
  }
};

export const getUserOrders = async (
  userId: string,
): Promise<ActionResponse<Awaited<ReturnType<typeof getUserOrdersByDb>>>> => {
  const parsedUserId = userIdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    return actionError("Invalid user id.");
  }

  try {
    const orders = await getUserOrdersByDb(parsedUserId.data);

    return actionSuccess(orders);
  } catch {
    return actionError("Failed to fetch orders.");
  }
};

export const getUserOrderById = async (
  userId: string,
  orderId: string,
): Promise<
  ActionResponse<
    | (Awaited<ReturnType<typeof getUserOrdersByDb>>[number] & {
        orderItems: Array<{
          id: string;
          quantity: number;
          price: number;
          product: {
            id: string;
            name: string;
            image: string;
            basePrice: number;
          };
        }>;
      })
    | null
  >
> => {
  const parsedUserId = userIdSchema.safeParse(userId);
  const parsedOrderId = z.string().cuid().safeParse(orderId);

  if (!parsedUserId.success || !parsedOrderId.success) {
    return actionError("Invalid order lookup payload.");
  }

  try {
    const order = await withPrismaRetry(() =>
      db.order.findFirst({
        where: {
          id: parsedOrderId.data,
          userId: parsedUserId.data,
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
    );

    if (!order) {
      return actionError("Order not found.");
    }

    return actionSuccess(order);
  } catch {
    return actionError("Failed to fetch order.");
  }
};
