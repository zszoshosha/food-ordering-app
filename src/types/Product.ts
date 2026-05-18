import { Prisma } from "@prisma/client";

/**
 * Product type with eagerly loaded `sizes` and `extras` relations.
 * Used throughout the app wherever product data from the database is displayed.
 */
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    sizes: true;
    extras: true;
  };
}>;
