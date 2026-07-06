"use server";

import Stripe from "stripe";

type CartItem = {
  price: number;
  quantity: number;
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(stripeSecretKey);

export async function createPaymentIntent(cartItems: CartItem[]) {
  const amountInHalalas = Math.round(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInHalalas,
    currency: "sar",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}
