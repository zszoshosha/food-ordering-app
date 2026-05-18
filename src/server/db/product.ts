import { Cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

/**
 * Fetches all products with their sizes and extras from the database.
 * Results are cached for 1 hour (3600 seconds) under the "best-sellers" key.
 *
 * @returns {Promise<ProductWithRelations[]>} All products with related sizes and extras.
 */
export const getProductsByDb = Cache(
  () => {
    const products = db.product.findMany({
      include: { sizes: true, extras: true },
    });
    return products;
  },
  ["best-sellers"],
  { revalidate: 3600 },
);
