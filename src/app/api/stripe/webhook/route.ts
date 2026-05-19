import { handleStripeWebhookEvent } from "@/server/Actions/Payment";
import { getStripeClient } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing stripe signature." },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: "Stripe webhook is not configured." },
        { status: 500 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const result = await handleStripeWebhookEvent(event);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process stripe webhook." },
      { status: 400 },
    );
  }
}
