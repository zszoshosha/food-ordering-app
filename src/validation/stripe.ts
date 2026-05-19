import * as z from "zod";

export const paymentIntentRequestSchema = z.object({
  orderId: z.string().cuid(),
});

export const mockConfirmPaymentSchema = z.object({
  orderId: z.string().cuid(),
  paymentIntentId: z.string().min(1),
});
