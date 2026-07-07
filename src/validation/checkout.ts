import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(20),
  sizeId: z.string().cuid().optional(),
  extraIds: z.array(z.string().cuid()).optional().default([]),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(6),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  zipCode: z.string().trim().min(3),
  notes: z.string().trim().optional(),
  total: z.number().min(0),
  items: z.array(checkoutItemSchema).min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
