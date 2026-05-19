import * as z from "zod";

/**
 * Validation for delivery queue update payload.
 */
export const deliveryOrderIdSchema = z.object({
  orderId: z.string().cuid(),
});
