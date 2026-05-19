import { Cache } from "@/lib/cache";
import { db, withPrismaRetry } from "@/lib/prisma";
import { ProductWithRelations } from "@/types/Product";

/**
 * Fetches all products with their sizes and extras from the database.
 * Results are cached for 1 hour (3600 seconds) under the "best-sellers" key.
 *
 * @returns {Promise<ProductWithRelations[]>} All products with related sizes and extras.
 */
export const getProductsByDb = Cache(
  async () => {
    try {
      return await withPrismaRetry(() =>
        db.product.findMany({
          include: { sizes: true, extras: true },
        }),
      );
    } catch (error) {
      // Keep storefront rendering during temporary database outages.
      console.error("Failed to load products from database:", error);
      return [] as ProductWithRelations[];
    }
  },
  ["best-sellers"],
  { revalidate: 3600 },
);
