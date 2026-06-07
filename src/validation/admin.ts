import {
  Extraingredient,
  ProductCategory,
  ProductSize,
  UserRole,
} from "@prisma/client";
import * as z from "zod";

/**
 * Strict validation for admin product create/update payloads.
 */
export const adminProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(120, "Product name must be at most 120 characters."),
  description: z
    .string()
    .trim()
    .min(8, "Description must be at least 8 characters.")
    .max(2000, "Description must be at most 2000 characters."),
  image: z.string().trim().min(1, "Please upload a product image."),
  basePrice: z.coerce
    .number()
    .min(0, "Base price must be greater than or equal to 0."),
  category: z.nativeEnum(ProductCategory, {
    message: "Please select a product category.",
  }),
  order: z.coerce
    .number()
    .int()
    .min(0, "Display order must be 0 or greater.")
    .optional(),
  sizes: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.nativeEnum(ProductSize),
        price: z.coerce.number().min(0, "Size price must be 0 or greater."),
      }),
    )
    .max(10, "You can add up to 10 sizes."),
  extras: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.nativeEnum(Extraingredient),
        price: z.coerce.number().min(0, "Extra price must be 0 or greater."),
      }),
    )
    .max(15, "You can add up to 15 extras."),
});

/**
 * Validation for order status transitions from the admin dashboard.
 */
export const adminOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.coerce.number().int().min(0).max(5),
});

/**
 * Validation for shared admin pagination query options.
 */
export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(10),
  search: z.string().trim().max(120).optional().default(""),
});

/**
 * Validation for admin users list filters.
 */
export const adminUsersQuerySchema = adminPaginationSchema.extend({
  role: z
    .union([z.literal("ALL"), z.nativeEnum(UserRole)])
    .optional()
    .default("ALL"),
});

/**
 * Validation for admin orders list filters.
 */
export const adminOrdersQuerySchema = adminPaginationSchema.extend({
  status: z
    .union([z.literal("ALL"), z.coerce.number().int().min(0).max(5)])
    .optional()
    .default("ALL"),
});

/**
 * Validation for admin product id query params.
 */
export const adminProductIdSchema = z.object({
  productId: z.string().cuid(),
});
