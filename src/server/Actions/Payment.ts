"use server";

import { db, withPrismaRetry } from "../../lib/prisma";
import {
  fromPrismaOrderStatus,
  getOrderStatusLabel,
  isValidOrderTransition,
  OrderStatus,
  toPrismaOrderStatus,
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

const toHalalas = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const [whole, fraction = ""] = amount.toFixed(2).split(".");
  const amountInHalalas = Number(whole) * 100 + Number(fraction);

  if (!Number.isFinite(amountInHalalas) || amountInHalalas <= 0) {
    return null;
  }

  return amountInHalalas;
};

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

  const currentStatus = fromPrismaOrderStatus(order.status);

  if (!isValidOrderTransition(currentStatus, OrderStatus.CONFIRMED)) {
    if (currentStatus === OrderStatus.CONFIRMED) {
      return actionSuccess({
        orderId: order.id,
        status: currentStatus,
        paymentIntentId: parsed.data.paymentIntentId,
      });
    }

    return actionError("Illegal order status transition to paid.");
  }

  const updated = await withPrismaRetry(() =>
    db.order.update({
      where: { id: order.id },
      data: {
        status: toPrismaOrderStatus(OrderStatus.CONFIRMED),
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
    statusLabel: getOrderStatusLabel(fromPrismaOrderStatus(updated.status)),
  });

  return actionSuccess({
    orderId: updated.id,
    status: fromPrismaOrderStatus(updated.status),
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

  if (fromPrismaOrderStatus(order.status) !== OrderStatus.PENDING) {
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

  const amountInHalalas = toHalalas(Number(order.total));
  if (!amountInHalalas) {
    return actionError("Order total is invalid for payment processing.");
  }

  const idempotencyKey = `payment_intent_${order.id}_${amountInHalalas}`;

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: amountInHalalas,
        currency: "sar",
        metadata: {
          orderId: order.id,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey,
      },
    );

    if (!intent.client_secret) {
      return actionError("Stripe did not return a client secret.");
    }

    return actionSuccess({
      orderId: order.id,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      simulated: false,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return actionError("Stripe authentication failed.");
    }

    if (error instanceof Stripe.errors.StripeConnectionError) {
      return actionError("Could not connect to Stripe. Please try again.");
    }

    if (error instanceof Stripe.errors.StripeRateLimitError) {
      return actionError("Stripe rate limit reached. Please retry shortly.");
    }

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return actionError("Invalid Stripe payment intent request.");
    }

    if (error instanceof Stripe.errors.StripeError) {
      return actionError(error.message || "Stripe payment failed.");
    }

    return actionError("Failed to create payment intent.");
  }
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
