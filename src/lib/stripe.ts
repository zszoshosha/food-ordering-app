import Stripe from "stripe";

let stripeClient: Stripe | null = null;

const STRIPE_API_VERSION = "2026-05-27.dahlia" as const;

const getStripeSecretKey = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return secretKey;
};

export const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return null;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

  return stripeClient;
};

export const stripe = getStripeClient();

export const isStripeSimulationMode = () => {
  return process.env.STRIPE_SIMULATION_MODE === "true";
};
