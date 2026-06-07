"use server";

import { db, withPrismaRetry } from "../../lib/prisma";
import {
  getOrderStatusLabel,
  isValidOrderTransition,
  OrderStatus,
} from "../../lib/order-state-machine";
import { sendMockOrderConfirmationEmail } from "../../lib/notifications/mockEmail";
import { getStripeClient, isStripeSimulationMode } from "../../lib/stripe";
import {
  ActionResponse,
  actionError,
  actionSuccess,
} from "../../types/action-response";
import {
  mockConfirmPaymentSchema,
  paymentIntentRequestSchema,
} from "../../validation/stripe";
import Stripe from "stripe";

export const markOrderPaid = async (
  orderId: string,
  paymentIntentId: string,
): Promise<
  ActionResponse<{
    orderId: string;
    status: number;
    paymentIntentId: string;
  }>
> => {
  const parsed = mockConfirmPaymentSchema.safeParse({
    orderId,
    paymentIntentId,
  });
  if (!parsed.success) {
    return actionError(
      "Invalid payment confirmation payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const order = await withPrismaRetry(() =>
    db.order.findUnique({
      where: { id: parsed.data.orderId },
      select: {
        id: true,
        status: true,
        total: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  );

  if (!order) {
    return actionError("Order not found.");
  }

  if (!isValidOrderTransition(order.status, OrderStatus.CONFIRMED)) {
    if (order.status === OrderStatus.CONFIRMED) {
      return actionSuccess({
        orderId: order.id,
        status: order.status,
        paymentIntentId: parsed.data.paymentIntentId,
      });
    }

    return actionError("Illegal order status transition to paid.");
  }

  const updated = await withPrismaRetry(() =>
    db.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
      },
      select: {
        id: true,
        status: true,
      },
    }),
  );

  sendMockOrderConfirmationEmail({
    customerName: order.user.name,
    customerEmail: order.user.email,
    orderId: order.id,
    total: Number(order.total || 0),
    statusLabel: getOrderStatusLabel(updated.status),
  });

  return actionSuccess({
    orderId: updated.id,
    status: updated.status,
    paymentIntentId: parsed.data.paymentIntentId,
  });
};

export const createPaymentIntentForOrder = async (
  orderId: string,
): Promise<
  ActionResponse<{
    orderId: string;
    paymentIntentId: string;
    clientSecret: string;
    simulated: boolean;
  }>
> => {
  const parsed = paymentIntentRequestSchema.safeParse({ orderId });
  if (!parsed.success) {
    return actionError(
      "Invalid payment intent payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const order = await withPrismaRetry(() =>
    db.order.findUnique({
      where: { id: parsed.data.orderId },
      select: {
        id: true,
        total: true,
        status: true,
      },
    }),
  );

  if (!order) {
    return actionError("Order not found.");
  }

  if (order.status !== OrderStatus.PENDING) {
    return actionError(
      "Payment intent can only be created for pending orders.",
    );
  }

  const simulationMode = isStripeSimulationMode();
  if (simulationMode) {
    const simulatedIntentId = `pi_sim_${order.id.slice(0, 16)}`;
    const simulatedSecret = `${simulatedIntentId}_secret_simulation`;

    return actionSuccess({
      orderId: order.id,
      paymentIntentId: simulatedIntentId,
      clientSecret: simulatedSecret,
      simulated: true,
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return actionError("Stripe is not configured.");
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(order.total) * 100),
    currency: "usd",
    metadata: {
      orderId: order.id,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (!intent.client_secret) {
    return actionError("Stripe did not return a client secret.");
  }

  return actionSuccess({
    orderId: order.id,
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    simulated: false,
  });
};

export const handleStripeWebhookEvent = async (
  event: Stripe.Event,
): Promise<ActionResponse<{ handled: boolean }>> => {
  if (event.type !== "payment_intent.succeeded") {
    return actionSuccess({ handled: false });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    return actionError("Missing order id in payment intent metadata.");
  }

  const result = await markOrderPaid(orderId, paymentIntent.id);
  if (!result.success) {
    return result;
  }

  return actionSuccess({ handled: true });
};
