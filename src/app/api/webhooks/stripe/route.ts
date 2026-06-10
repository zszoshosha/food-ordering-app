import { db, withPrismaRetry } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import {
  fromPrismaOrderStatus,
  OrderStatus,
  toPrismaOrderStatus,
} from "@/lib/order-state-machine";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const processCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
): Promise<void> => {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw new Error("Missing orderId metadata on checkout session.");
  }

  await withPrismaRetry(async () => {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new Error(
        `Order not found for webhook metadata orderId=${orderId}.`,
      );
    }

    if (fromPrismaOrderStatus(order.status) === OrderStatus.CONFIRMED) {
      return;
    }

    await db.order.update({
      where: { id: order.id },
      data: { status: toPrismaOrderStatus(OrderStatus.CONFIRMED) },
    });
  });
};

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { success: false, error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { success: false, error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await processCheckoutCompleted(session);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);

    // Return 500 so Stripe retries transient failures.
    return NextResponse.json(
      { success: false, error: "Failed to process webhook event." },
      { status: 500 },
    );
  }
}
