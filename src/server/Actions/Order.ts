"use server";

import { db } from "../../lib/prisma";
import { createOrderByDb } from "../db/order";
import {
  checkoutSchema,
  type CheckoutInput,
  type CheckoutItemInput,
} from "../../validation/checkout";

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

export const createOrder = async (userId: string, payload: unknown) => {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: "Invalid checkout payload.",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const productIds = [...new Set(data.items.map((item) => item.productId))];

  const products = await db.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      sizes: true,
      extras: true,
    },
  });

  if (products.length !== productIds.length) {
    return {
      ok: false as const,
      status: 400,
      error: "One or more cart items are no longer available.",
    };
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
      return {
        ok: false as const,
        status: 400,
        error: "Cart total changed. Please review your cart and try again.",
      };
    }

    const createdOrder = await createOrderByDb({
      userId,
      address: buildAddress(data),
      total,
      orderItems: pricedItems,
    });

    return {
      ok: true as const,
      status: 201,
      order: {
        id: createdOrder.id,
        total: createdOrder.total,
        createdAt: createdOrder.createdAt,
      },
    };
  } catch (error) {
    console.error("Create order failed:", error);
    return {
      ok: false as const,
      status: 500,
      error: "Failed to create order. Please try again.",
    };
  }
};
