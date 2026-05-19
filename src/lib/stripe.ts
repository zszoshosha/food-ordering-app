import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });

  return stripeClient;
};

export const isStripeSimulationMode = () => {
  if (process.env.STRIPE_SIMULATION_MODE) {
    return process.env.STRIPE_SIMULATION_MODE === "true";
  }

  return process.env.NODE_ENV !== "production";
};
